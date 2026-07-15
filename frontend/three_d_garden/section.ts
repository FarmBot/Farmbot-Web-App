import React from "react";
import { Material, Object3D, Plane, Vector3 } from "three";
import { useSpring } from "@react-spring/three";
import { Config } from "./config";
import { ThreeDSectionAxis } from "../farm_designer/interfaces";
import { get3DPositionFunc } from "./helpers";
import { CAMERA_SPRING_CONFIG } from "./focus_transition";

export const SECTION_CLIPPING_EXEMPT = "sectionClippingExempt";
export const SECTION_FAR_CLIPPING_EXEMPT = "sectionFarClippingExempt";
export const SECTION_AXIS_EXIT_SPRING_CONFIG = { duration: 200 };
export const SECTION_PLANE_OUTSIDE_OFFSET = 1000;

type SectionPlaneConfig = Pick<Config,
  "bedLengthOuter" | "bedWidthOuter" | "bedXOffset" | "bedYOffset"
  | "mirrorX" | "mirrorY">;

export type SectionOutsidePlaneConstants = Record<
  ThreeDSectionAxis,
  [number, number]
>;

export const getSectionOutsidePlaneConstants = (
  config: SectionPlaneConfig,
): SectionOutsidePlaneConstants => {
  const getPosition = get3DPositionFunc(config);
  const firstBedCorner = getPosition({
    x: -config.bedXOffset,
    y: -config.bedYOffset,
  });
  const secondBedCorner = getPosition({
    x: config.bedLengthOuter - config.bedXOffset,
    y: config.bedWidthOuter - config.bedYOffset,
  });
  const constantsForAxis = (axis: ThreeDSectionAxis): [number, number] => {
    const lower = Math.min(firstBedCorner[axis], secondBedCorner[axis])
      - SECTION_PLANE_OUTSIDE_OFFSET;
    const upper = Math.max(firstBedCorner[axis], secondBedCorner[axis])
      + SECTION_PLANE_OUTSIDE_OFFSET;
    return [-lower, upper];
  };
  return {
    x: constantsForAxis("x"),
    y: constantsForAxis("y"),
  };
};

export const getSectionClippingPlanes = (
  config: SectionPlaneConfig,
  axis: ThreeDSectionAxis,
  center: number,
  width: number,
): Plane[] => {
  const position = get3DPositionFunc(config)({ x: center, y: center });
  const worldCenter = position[axis];
  const lower = worldCenter - width / 2;
  const upper = worldCenter + width / 2;
  const normal = axis == "x"
    ? new Vector3(1, 0, 0)
    : new Vector3(0, 1, 0);
  const lowerPlane = new Plane(normal, -lower);
  const upperPlane = new Plane(normal.clone().negate(), upper);
  return [lowerPlane, upperPlane];
};

export const sectionNearPlaneIndex = (
  planes: Plane[],
  axis: ThreeDSectionAxis,
  cameraPosition: { x: number; y: number },
) => {
  if (planes.length < 2) { return 0; }
  const lower = -planes[0].constant / planes[0].normal[axis];
  const upper = -planes[1].constant / planes[1].normal[axis];
  return cameraPosition[axis] >= (lower + upper) / 2 ? 1 : 0;
};

const DEFAULT_OUTSIDE_PLANE_CONSTANTS: SectionOutsidePlaneConstants = {
  x: [5000, 5000],
  y: [5000, 5000],
};

export const useAnimatedSectionPlanes = (
  enabled: boolean,
  axis: ThreeDSectionAxis,
  targetPlanes: Plane[],
  followCenter = false,
  outsidePlaneConstants = DEFAULT_OUTSIDE_PLANE_CONSTANTS,
  immediate = false,
  // eslint-disable-next-line complexity
) => {
  const [mounted, setMounted] = React.useState(enabled);
  const mountedRef = React.useRef(enabled);
  const [displayAxis, setDisplayAxis] = React.useState(axis);
  const outsidePlaneConstantsForAxis =
    outsidePlaneConstants[displayAxis];
  const [constants, setConstants] = React.useState<[number, number]>(
    outsidePlaneConstants[axis],
  );
  const [opacity, setOpacity] = React.useState(enabled ? 1 : 0);
  const opacityRef = React.useRef(opacity);
  const [, api] = useSpring(() => ({
    first: constants[0],
    second: constants[1],
    opacity,
  }));
  const targetFirst = targetPlanes[0]?.constant || 0;
  const targetSecond = targetPlanes[1]?.constant || 0;
  const lowerPosition = targetPlanes[0]
    ? -targetPlanes[0].constant / targetPlanes[0].normal[axis]
    : 0;
  const upperPosition = targetPlanes[1]
    ? -targetPlanes[1].constant / targetPlanes[1].normal[axis]
    : 0;
  const targetCenter = (lowerPosition + upperPosition) / 2;
  const targetCenterRef = React.useRef(targetCenter);
  React.useLayoutEffect(() => {
    targetCenterRef.current = targetCenter;
  }, [targetCenter]);
  const targetHalfWidth = Math.abs(upperPosition - lowerPosition) / 2;
  const springTargetFirst = followCenter ? targetHalfWidth : targetFirst;
  const springTargetSecond = followCenter ? targetHalfWidth : targetSecond;
  const [displayCenter, setDisplayCenter] = React.useState(targetCenter);
  const [displayFollowCenter, setDisplayFollowCenter] =
    React.useState(followCenter);
  const [directConstants, setDirectConstants] = React.useState(!enabled);
  const directConstantsRef = React.useRef(!enabled);
  const halfWidth = (constants[0] + constants[1]) / 2;
  const followModeChanging = displayFollowCenter != followCenter;
  const transitionTargetFirst = followModeChanging || directConstants
    ? targetFirst
    : springTargetFirst;
  const transitionTargetSecond = followModeChanging || directConstants
    ? targetSecond
    : springTargetSecond;
  const retainDisplayedCenter = displayFollowCenter && !followCenter;
  const renderedCenter = displayAxis == axis && !retainDisplayedCenter
    ? targetCenter
    : displayCenter;
  const renderedConstants = React.useMemo<[number, number]>(() => {
    if (immediate && displayAxis == axis) {
      return followCenter
        ? [-targetCenter + targetHalfWidth, targetCenter + targetHalfWidth]
        : [targetFirst, targetSecond];
    }
    return displayFollowCenter && !directConstants
      ? [-renderedCenter + halfWidth, renderedCenter + halfWidth]
      : constants;
  }, [
    axis,
    constants,
    directConstants,
    displayAxis,
    displayFollowCenter,
    followCenter,
    halfWidth,
    immediate,
    renderedCenter,
    targetCenter,
    targetFirst,
    targetHalfWidth,
    targetSecond,
  ]);
  const renderedConstantsRef = React.useRef(renderedConstants);

  React.useLayoutEffect(() => {
    renderedConstantsRef.current = renderedConstants;
    if (displayAxis == axis
      && !directConstants
      && !followModeChanging) {
      // Keep the outgoing axis's last exact followed center available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayCenter(current => Object.is(current, targetCenter)
        ? current
        : targetCenter);
    }
  }, [
    axis,
    directConstants,
    displayAxis,
    followModeChanging,
    renderedConstants,
    targetCenter,
  ]);

  React.useEffect(() => {
    let active = true;
    const setDirect = (value: boolean) => {
      directConstantsRef.current = value;
      setDirectConstants(value);
    };
    const apply = (value: {
      first?: number;
      second?: number;
      opacity?: number;
    }) => {
      if (!active) { return; }
      setConstants(current => [
        value.first ?? current[0],
        value.second ?? current[1],
      ]);
      if (value.opacity !== undefined) {
        opacityRef.current = value.opacity;
        setOpacity(value.opacity);
      }
    };
    const springOut = (onRest: () => void, axisChange = false) => {
      const current = renderedConstantsRef.current;
      const targetOpacity = 0;
      setDirect(true);
      setConstants(existing =>
        Object.is(existing[0], current[0])
          && Object.is(existing[1], current[1])
          ? existing
          : [current[0], current[1]]);
      return api.start({
        from: {
          first: current[0],
          second: current[1],
          opacity: opacityRef.current,
        },
        first: outsidePlaneConstantsForAxis[0],
        second: outsidePlaneConstantsForAxis[1],
        opacity: targetOpacity,
        reset: true,
        immediate: false,
        config: axisChange
          ? SECTION_AXIS_EXIT_SPRING_CONFIG
          : CAMERA_SPRING_CONFIG,
        onChange: result => apply(result.value),
        onRest: () => {
          if (!active) { return; }
          opacityRef.current = targetOpacity;
          setOpacity(targetOpacity);
          onRest();
        },
      });
    };
    const setOutsideAxis = (
      nextAxis: ThreeDSectionAxis,
      nextOpacity: number,
    ) => {
      const nextOutsideConstants = outsidePlaneConstants[nextAxis];
      api.set({
        first: nextOutsideConstants[0],
        second: nextOutsideConstants[1],
        opacity: nextOpacity,
      });
      opacityRef.current = nextOpacity;
      setOpacity(nextOpacity);
      setConstants(nextOutsideConstants);
      setDisplayCenter(targetCenterRef.current);
      setDisplayFollowCenter(followCenter);
      setDisplayAxis(nextAxis);
    };
    if (!enabled) {
      if (!mountedRef.current) {
        const nextOutsideConstants = outsidePlaneConstants[axis];
        const current = renderedConstantsRef.current;
        if (displayAxis != axis
          || current[0] != nextOutsideConstants[0]
          || current[1] != nextOutsideConstants[1]) {
          setOutsideAxis(axis, 0);
        }
      } else {
        springOut(() => {
          mountedRef.current = false;
          setMounted(false);
          if (displayAxis != axis) { setOutsideAxis(axis, 0); }
        });
      }
    } else {
      // Enabling clipping intentionally retains/mounts the animated planes.
      mountedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      if (displayAxis != axis) {
        springOut(() => {
          setDirect(false);
          setOutsideAxis(axis, 0);
        }, true);
      } else {
        if (immediate) {
          setDirect(false);
          setDisplayCenter(targetCenterRef.current);
          setDisplayFollowCenter(followCenter);
          api.set({
            first: springTargetFirst,
            second: springTargetSecond,
            opacity: 1,
          });
          opacityRef.current = 1;
          setOpacity(1);
          setConstants(current =>
            Object.is(current[0], springTargetFirst)
              && Object.is(current[1], springTargetSecond)
              ? current
              : [springTargetFirst, springTargetSecond]);
        } else if (followModeChanging || directConstantsRef.current) {
          const current = renderedConstantsRef.current;
          setDirect(true);
          setConstants(existing =>
            Object.is(existing[0], current[0])
              && Object.is(existing[1], current[1])
              ? existing
              : [current[0], current[1]]);
          api.start({
            from: {
              first: current[0],
              second: current[1],
              opacity: opacityRef.current,
            },
            first: transitionTargetFirst,
            second: transitionTargetSecond,
            opacity: 1,
            reset: true,
            immediate: false,
            config: CAMERA_SPRING_CONFIG,
            onChange: result => apply(result.value),
            onRest: () => {
              if (!active) { return; }
              setDisplayCenter(targetCenterRef.current);
              setDisplayFollowCenter(followCenter);
              setDirect(false);
              setConstants([springTargetFirst, springTargetSecond]);
              opacityRef.current = 1;
              setOpacity(1);
            },
          });
        } else {
          setDirect(false);
          api.start({
            first: springTargetFirst,
            second: springTargetSecond,
            opacity: 1,
            immediate: false,
            config: CAMERA_SPRING_CONFIG,
            onChange: result => apply(result.value),
            onRest: () => {
              if (!active) { return; }
              setConstants([springTargetFirst, springTargetSecond]);
              opacityRef.current = 1;
              setOpacity(1);
            },
          });
        }
      }
    }
    return () => {
      active = false;
      api.stop?.();
    };
  }, [
    api,
    axis,
    displayAxis,
    enabled,
    followCenter,
    followModeChanging,
    immediate,
    outsidePlaneConstantsForAxis,
    outsidePlaneConstants,
    springTargetFirst,
    springTargetSecond,
    transitionTargetFirst,
    transitionTargetSecond,
  ]);

  const planes = React.useMemo(() => {
    const normal = displayAxis == "x"
      ? new Vector3(1, 0, 0)
      : new Vector3(0, 1, 0);
    return [
      new Plane(normal, renderedConstants[0]),
      new Plane(normal.clone().negate(), renderedConstants[1]),
    ];
  }, [displayAxis, renderedConstants]);
  return { mounted, planes, axis: displayAxis, opacity };
};

interface MaterialOwner extends Object3D {
  material?: Material | Material[];
}

interface MaterialState {
  clippingPlanes: Plane[] | null;
  clipShadows: boolean;
}

const ownerMaterials = (owner: MaterialOwner): Material[] => {
  if (!owner.material) { return []; }
  return Array.isArray(owner.material) ? owner.material : [owner.material];
};

export interface SectionClippingBinding {
  update(planes: Plane[]): void;
  restore(): void;
}

type ChildAddedListener = (event: { child: Object3D }) => void;
type BeforeRenderCallback = Object3D["onBeforeRender"];

interface BeforeRenderRecord {
  original: BeforeRenderCallback;
  wrapper: BeforeRenderCallback;
}

export const createSectionClippingBinding = (
  root: Object3D,
  clipAll = false,
): SectionClippingBinding => {
  const states = new Map<Material, MaterialState>();
  const farExemptMaterials = new Set<Material>();
  const listeners = new Map<Object3D, ChildAddedListener>();
  const beforeRenderCallbacks = new Map<Object3D, BeforeRenderRecord>();
  let sectionPlanes: Plane[] = [];

  const sectionPlaneCount = (material: Material) =>
    farExemptMaterials.has(material) && !clipAll
      ? Math.min(1, sectionPlanes.length)
      : sectionPlanes.length;

  const materialMatches = (
    material: Material,
    state: MaterialState,
    includeSectionPlanes: boolean,
  ) => {
    if (!includeSectionPlanes) {
      return material.clippingPlanes == state.clippingPlanes
        && material.clipShadows == state.clipShadows;
    }
    const basePlanes = state.clippingPlanes || [];
    const addedPlaneCount = sectionPlaneCount(material);
    const currentPlanes = material.clippingPlanes || [];
    if (currentPlanes.length != basePlanes.length + addedPlaneCount) {
      return false;
    }
    for (let index = 0; index < basePlanes.length; index++) {
      if (currentPlanes[index] != basePlanes[index]) { return false; }
    }
    for (let index = 0; index < addedPlaneCount; index++) {
      if (currentPlanes[basePlanes.length + index] != sectionPlanes[index]) {
        return false;
      }
    }
    const desiredClipShadows = addedPlaneCount > 0
      ? true
      : state.clipShadows;
    return material.clipShadows == desiredClipShadows;
  };

  const applyMaterial = (material: Material) => {
    if (!states.has(material)) {
      const clippingPlanes = material.clippingPlanes;
      states.set(material, {
        clippingPlanes: clippingPlanes
          ? clippingPlanes.filter(plane => !sectionPlanes.includes(plane))
          : clippingPlanes,
        clipShadows: material.clipShadows,
      });
    }
    const state = states.get(material) as MaterialState;
    if (materialMatches(material, state, true)) { return; }
    const addedPlaneCount = sectionPlaneCount(material);
    const basePlanes = state.clippingPlanes || [];
    material.clippingPlanes = [
      ...basePlanes,
      ...sectionPlanes.slice(0, addedPlaneCount),
    ];
    material.clipShadows = addedPlaneCount > 0
      ? true
      : state.clipShadows;
  };

  const applyOwnerMaterials = (
    object: MaterialOwner,
    farExempt: boolean,
  ) => {
    const materials = ownerMaterials(object);
    if (farExempt) {
      materials.map(material => farExemptMaterials.add(material));
    }
    materials.map(applyMaterial);
  };

  const register = (object: Object3D, farExempt = false) => {
    const objectExempt = !!object.userData[SECTION_CLIPPING_EXEMPT];
    if (objectExempt) { return; }
    const objectFarExempt = farExempt
      || !!object.userData[SECTION_FAR_CLIPPING_EXEMPT];
    const materials = ownerMaterials(object);
    applyOwnerMaterials(object, objectFarExempt);
    if (materials.length > 0 || "material" in object) {
      const original = object.onBeforeRender;
      const wrapper: BeforeRenderCallback = function (
        this: Object3D,
        ...args
      ) {
        applyOwnerMaterials(object, objectFarExempt);
        original.apply(this, args);
      };
      object.onBeforeRender = wrapper;
      beforeRenderCallbacks.set(object, { original, wrapper });
    }
    const listener = (event: { child: Object3D }) =>
      register(event.child, objectFarExempt);
    object.addEventListener("childadded", listener);
    listeners.set(object, listener);
    object.children.map(child => register(child, objectFarExempt));
  };

  register(root);

  return {
    update: planes => {
      sectionPlanes = planes;
      states.forEach((_state, material) => applyMaterial(material));
    },
    restore: () => {
      listeners.forEach((listener, object) =>
        object.removeEventListener("childadded", listener));
      listeners.clear();
      beforeRenderCallbacks.forEach(({ original, wrapper }, object) => {
        if (object.onBeforeRender == wrapper) {
          object.onBeforeRender = original;
        }
      });
      beforeRenderCallbacks.clear();
      states.forEach((state, material) => {
        if (materialMatches(material, state, false)) { return; }
        material.clippingPlanes = state.clippingPlanes;
        material.clipShadows = state.clipShadows;
      });
      states.clear();
      farExemptMaterials.clear();
    },
  };
};

export const useSectionClipping = (
  enabled: boolean,
  root: Object3D | undefined,
  planes: Plane[],
  clipAll = false,
) => {
  const bindingRef =
    React.useRef<SectionClippingBinding | undefined>(undefined);
  React.useLayoutEffect(() => {
    if (!enabled || !root) { return; }
    const binding = createSectionClippingBinding(root, clipAll);
    bindingRef.current = binding;
    return () => {
      binding.restore();
      if (bindingRef.current == binding) {
        bindingRef.current = undefined;
      }
    };
  }, [clipAll, enabled, root]);
  React.useLayoutEffect(() => {
    bindingRef.current?.update(planes);
  }, [clipAll, enabled, planes, root]);
};
