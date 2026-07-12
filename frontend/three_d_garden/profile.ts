import React from "react";
import { Material, Object3D, Plane, Vector3 } from "three";
import { useSpring } from "@react-spring/three";
import { Config } from "./config";
import { ThreeDProfileAxis } from "../farm_designer/interfaces";
import { get3DPositionFunc } from "./helpers";
import { CAMERA_SPRING_CONFIG } from "./focus_transition";

export const PROFILE_CLIPPING_EXEMPT = "profileClippingExempt";
export const PROFILE_FAR_CLIPPING_EXEMPT = "profileFarClippingExempt";

type ProfilePlaneConfig = Pick<Config,
  "bedLengthOuter" | "bedWidthOuter" | "bedXOffset" | "bedYOffset"
  | "mirrorX" | "mirrorY">;

const PROFILE_OUTSIDE_MARGIN = 1000;

export const getProfileOutsidePlaneConstants = (
  config: Pick<ProfilePlaneConfig,
    "bedLengthOuter" | "bedWidthOuter">,
): Record<ThreeDProfileAxis, number> => ({
  x: config.bedLengthOuter / 2 + PROFILE_OUTSIDE_MARGIN,
  y: config.bedWidthOuter / 2 + PROFILE_OUTSIDE_MARGIN,
});

export const getProfileClippingPlanes = (
  config: ProfilePlaneConfig,
  axis: ThreeDProfileAxis,
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

export const profileNearPlaneIndex = (
  planes: Plane[],
  axis: ThreeDProfileAxis,
  cameraPosition: { x: number; y: number },
) => {
  if (planes.length < 2) { return 0; }
  const lower = -planes[0].constant / planes[0].normal[axis];
  const upper = -planes[1].constant / planes[1].normal[axis];
  return cameraPosition[axis] >= (lower + upper) / 2 ? 1 : 0;
};

const DEFAULT_OUTSIDE_PLANE_CONSTANTS = { x: 5000, y: 5000 };

export const useAnimatedProfilePlanes = (
  enabled: boolean,
  axis: ThreeDProfileAxis,
  targetPlanes: Plane[],
  followCenter = false,
  outsidePlaneConstants = DEFAULT_OUTSIDE_PLANE_CONSTANTS,
) => {
  const [mounted, setMounted] = React.useState(enabled);
  const [displayAxis, setDisplayAxis] = React.useState(axis);
  const outsidePlaneConstant = outsidePlaneConstants[displayAxis];
  const [constants, setConstants] = React.useState<[number, number]>([
    outsidePlaneConstants[axis],
    outsidePlaneConstants[axis],
  ]);
  const [, api] = useSpring(() => ({
    first: constants[0],
    second: constants[1],
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
  const targetHalfWidth = Math.abs(upperPosition - lowerPosition) / 2;
  const springTargetFirst = followCenter ? targetHalfWidth : targetFirst;
  const springTargetSecond = followCenter ? targetHalfWidth : targetSecond;
  const [displayCenter, setDisplayCenter] = React.useState(targetCenter);
  const [directConstants, setDirectConstants] = React.useState(false);
  const halfWidth = (constants[0] + constants[1]) / 2;
  const renderedCenter = displayAxis == axis
    ? targetCenter
    : displayCenter;
  const renderedConstants = React.useMemo<[number, number]>(() =>
    followCenter && !directConstants
      ? [-renderedCenter + halfWidth, renderedCenter + halfWidth]
      : constants, [
    constants,
    directConstants,
    followCenter,
    halfWidth,
    renderedCenter,
  ]);
  const renderedConstantsRef = React.useRef(renderedConstants);

  React.useLayoutEffect(() => {
    renderedConstantsRef.current = renderedConstants;
    if (displayAxis == axis && !directConstants) {
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
    renderedConstants,
    targetCenter,
  ]);

  React.useEffect(() => {
    let active = true;
    const apply = (value: { first?: number; second?: number }) => {
      if (!active) { return; }
      setConstants(current => [
        value.first ?? current[0],
        value.second ?? current[1],
      ]);
    };
    const springOut = (onRest: () => void) => {
      const current = renderedConstantsRef.current;
      setDirectConstants(true);
      setConstants(existing =>
        Object.is(existing[0], current[0])
          && Object.is(existing[1], current[1])
          ? existing
          : [current[0], current[1]]);
      return api.start({
        from: { first: current[0], second: current[1] },
        first: outsidePlaneConstant,
        second: outsidePlaneConstant,
        reset: true,
        immediate: false,
        config: CAMERA_SPRING_CONFIG,
        onChange: result => apply(result.value),
        onRest: () => active && onRest(),
      });
    };
    if (!enabled) {
      springOut(() => setMounted(false));
    } else {
      // Enabling clipping intentionally retains/mounts the animated planes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      if (displayAxis != axis) {
        springOut(() => {
          setDirectConstants(false);
          setConstants([
            outsidePlaneConstants[axis],
            outsidePlaneConstants[axis],
          ]);
          setDisplayAxis(axis);
        });
      } else {
        setDirectConstants(false);
        api.start({
          first: springTargetFirst,
          second: springTargetSecond,
          immediate: false,
          config: CAMERA_SPRING_CONFIG,
          onChange: result => apply(result.value),
          onRest: () => active
            && setConstants([springTargetFirst, springTargetSecond]),
        });
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
    outsidePlaneConstant,
    outsidePlaneConstants,
    springTargetFirst,
    springTargetSecond,
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
  return { mounted, planes, axis: displayAxis };
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

export interface ProfileClippingBinding {
  update(planes: Plane[]): void;
  restore(): void;
}

type ChildAddedListener = (event: { child: Object3D }) => void;
type BeforeRenderCallback = Object3D["onBeforeRender"];

interface BeforeRenderRecord {
  original: BeforeRenderCallback;
  wrapper: BeforeRenderCallback;
}

export const createProfileClippingBinding = (
  root: Object3D,
): ProfileClippingBinding => {
  const states = new Map<Material, MaterialState>();
  const farExemptMaterials = new Set<Material>();
  const listeners = new Map<Object3D, ChildAddedListener>();
  const beforeRenderCallbacks = new Map<Object3D, BeforeRenderRecord>();
  let profilePlanes: Plane[] = [];

  const profilePlaneCount = (material: Material) =>
    farExemptMaterials.has(material)
      ? Math.min(1, profilePlanes.length)
      : profilePlanes.length;

  const materialMatches = (
    material: Material,
    state: MaterialState,
    includeProfilePlanes: boolean,
  ) => {
    if (!includeProfilePlanes) {
      return material.clippingPlanes == state.clippingPlanes
        && material.clipShadows == state.clipShadows;
    }
    const basePlanes = state.clippingPlanes || [];
    const addedPlaneCount = profilePlaneCount(material);
    const currentPlanes = material.clippingPlanes || [];
    if (currentPlanes.length != basePlanes.length + addedPlaneCount) {
      return false;
    }
    for (let index = 0; index < basePlanes.length; index++) {
      if (currentPlanes[index] != basePlanes[index]) { return false; }
    }
    for (let index = 0; index < addedPlaneCount; index++) {
      if (currentPlanes[basePlanes.length + index] != profilePlanes[index]) {
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
          ? clippingPlanes.filter(plane => !profilePlanes.includes(plane))
          : clippingPlanes,
        clipShadows: material.clipShadows,
      });
    }
    const state = states.get(material) as MaterialState;
    if (materialMatches(material, state, true)) { return; }
    const addedPlaneCount = profilePlaneCount(material);
    const basePlanes = state.clippingPlanes || [];
    material.clippingPlanes = [
      ...basePlanes,
      ...profilePlanes.slice(0, addedPlaneCount),
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
    const objectExempt = !!object.userData[PROFILE_CLIPPING_EXEMPT];
    if (objectExempt) { return; }
    const objectFarExempt = farExempt
      || !!object.userData[PROFILE_FAR_CLIPPING_EXEMPT];
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
      profilePlanes = planes;
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

export const useProfileClipping = (
  enabled: boolean,
  root: Object3D | undefined,
  planes: Plane[],
) => {
  const bindingRef =
    React.useRef<ProfileClippingBinding | undefined>(undefined);
  React.useLayoutEffect(() => {
    if (!enabled || !root) { return; }
    const binding = createProfileClippingBinding(root);
    bindingRef.current = binding;
    return () => {
      binding.restore();
      if (bindingRef.current == binding) {
        bindingRef.current = undefined;
      }
    };
  }, [enabled, root]);
  React.useLayoutEffect(() => {
    bindingRef.current?.update(planes);
  }, [enabled, planes, root]);
};
