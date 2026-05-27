import React from "react";
import { useSpring } from "@react-spring/three";
import { Material, Object3D } from "three";
import { Group } from "./components";
import { Camera, VectorXyz } from "./zoom_beacons_constants";

export const FOCUS_TRANSITION_MS = 900;

export const easeInOutCubic = (t: number) =>
  t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface FocusTransitionContextValue {
  enabled: boolean;
  duration: number;
}

const FocusTransitionContext =
  React.createContext<FocusTransitionContextValue>({
    enabled: false,
    duration: FOCUS_TRANSITION_MS,
  });

export interface FocusTransitionProviderProps {
  enabled: boolean;
  duration?: number;
  children: React.ReactNode;
}

export const FocusTransitionProvider =
  (props: FocusTransitionProviderProps) => {
    const parent = React.useContext(FocusTransitionContext);
    const value = React.useMemo<FocusTransitionContextValue>(() => ({
      enabled: props.enabled,
      duration: props.duration || parent.duration || FOCUS_TRANSITION_MS,
    }), [parent.duration, props.duration, props.enabled]);
    return <FocusTransitionContext.Provider value={value}>
      {props.children}
    </FocusTransitionContext.Provider>;
  };

export const useFocusTransition = () =>
  React.useContext(FocusTransitionContext);

interface MaterialState {
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
}

type MaterialSlot = Material | Material[];

interface MaterialOwner extends Object3D {
  material?: MaterialSlot;
}

interface MaterialRecord {
  owner: MaterialOwner;
  original: MaterialSlot;
  clones: MaterialSlot;
  states: MaterialState[];
}

const isMaterial = (value: unknown): value is Material =>
  !!value
  && typeof value == "object"
  && typeof (value as Material).clone == "function";

const materialState = (material: Material): MaterialState => ({
  opacity: material.opacity,
  transparent: material.transparent,
  depthWrite: material.depthWrite,
});

const cloneMaterial = (material: Material) => {
  const clone = material.clone();
  clone.onBeforeCompile = material.onBeforeCompile;
  return clone;
};

const cloneSlot = (slot: MaterialSlot): {
  clones: MaterialSlot;
  states: MaterialState[];
} | undefined => {
  if (Array.isArray(slot)) {
    const clones = slot.map(cloneMaterial);
    return { clones, states: clones.map(materialState) };
  }
  if (!isMaterial(slot)) { return undefined; }
  const clone = cloneMaterial(slot);
  return { clones: clone, states: [materialState(clone)] };
};

const forEachMaterial =
  (slot: MaterialSlot, callback: (material: Material, index: number) => void) => {
    if (Array.isArray(slot)) {
      slot.map(callback);
    } else if (isMaterial(slot)) {
      callback(slot, 0);
    }
  };

export const applyFocusMaterialOpacity = (
  material: Material,
  state: MaterialState,
  opacity: number,
  preserveDepthWrite = false,
) => {
  material.opacity = state.opacity * opacity;
  material.transparent = state.transparent || opacity < 1;
  material.depthWrite = preserveDepthWrite || opacity >= 1
    ? state.depthWrite
    : false;
  material.needsUpdate = true;
};

interface CreateFocusMaterialBindingOptions {
  preserveDepthWrite?: boolean;
}

export const createFocusMaterialBinding = (
  root: Object3D,
  options: CreateFocusMaterialBindingOptions = {},
) => {
  const records: MaterialRecord[] = [];
  root.traverse(child => {
    const owner = child as MaterialOwner;
    if (!owner.material) { return; }
    const clone = cloneSlot(owner.material);
    if (!clone) { return; }
    records.push({
      owner,
      original: owner.material,
      clones: clone.clones,
      states: clone.states,
    });
    owner.material = clone.clones;
  });

  return {
    apply: (opacity: number) => {
      records.map(record =>
        forEachMaterial(record.clones, (material, index) =>
          applyFocusMaterialOpacity(
            material,
            record.states[index],
            opacity,
            !!options.preserveDepthWrite,
          )));
    },
    restore: () => {
      records.map(record => {
        record.owner.material = record.original;
        forEachMaterial(record.clones, material => material.dispose());
      });
    },
  };
};

const canTraverse = (value: unknown): value is Object3D =>
  !!value
  && typeof value == "object"
  && typeof (value as Object3D).traverse == "function";

const setVector = (
  vector: { set(x: number, y: number, z: number): void },
  values: VectorXyz,
) => vector.set(values[0], values[1], values[2]);

export type FocusVisibilityGroupProps =
  React.ComponentProps<typeof Group> & {
    visible: boolean;
    keepMounted?: boolean;
    materialBindingKey?: React.Key;
    preserveDepthWrite?: boolean;
  };

export const shouldUnmountFocusVisibilityGroup = (
  rendered: boolean,
  visible: boolean,
  keepMounted?: boolean,
) => !rendered && !visible && !keepMounted;

export const FocusVisibilityGroup =
  React.forwardRef<Object3D, FocusVisibilityGroupProps>((props, forwardedRef) => {
    const {
      visible, keepMounted, materialBindingKey, preserveDepthWrite, children,
      ...groupProps
    } = props;
    const transition = useFocusTransition();
    const enabled = transition.enabled;
    const [rendered, setRendered] = React.useState(visible || !!keepMounted);
    const [groupVisible, setGroupVisible] = React.useState(visible);
    const groupRef = React.useRef<Object3D | undefined>(undefined);
    const opacityRef = React.useRef(visible ? 1 : 0);
    const materialBinding = React.useRef<ReturnType<
      typeof createFocusMaterialBinding
    > | undefined>(undefined);

    const restoreMaterialBinding = React.useCallback(() => {
      materialBinding.current?.restore();
      materialBinding.current = undefined;
    }, []);

    const refreshMaterialBinding = React.useCallback(() => {
      if (!enabled || !canTraverse(groupRef.current)) { return; }
      restoreMaterialBinding();
      materialBinding.current = createFocusMaterialBinding(groupRef.current, {
        preserveDepthWrite,
      });
      materialBinding.current.apply(opacityRef.current);
    }, [enabled, preserveDepthWrite, restoreMaterialBinding]);

    const setRef = React.useCallback((value: Object3D | null) => {
      if (!value) {
        groupRef.current = undefined;
        restoreMaterialBinding();
        return;
      }
      groupRef.current = value;
      if (enabled && canTraverse(value)) {
        materialBinding.current ||= createFocusMaterialBinding(value, {
          preserveDepthWrite,
        });
        materialBinding.current.apply(opacityRef.current);
      }
      if (typeof forwardedRef == "function") {
        forwardedRef(value);
      } else if (forwardedRef) {
        forwardedRef.current = value;
      }
    }, [enabled, forwardedRef, preserveDepthWrite, restoreMaterialBinding]);

    const applyOpacity = React.useCallback((opacity: number) => {
      opacityRef.current = opacity;
      if (!enabled || !canTraverse(groupRef.current)) { return; }
      materialBinding.current ||= createFocusMaterialBinding(groupRef.current, {
        preserveDepthWrite,
      });
      materialBinding.current.apply(opacity);
    }, [enabled, preserveDepthWrite]);

    React.useEffect(() => {
      if (enabled && visible) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRendered(true);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGroupVisible(true);
      }
    }, [enabled, visible]);

    React.useEffect(() => {
      if (materialBindingKey === undefined) { return; }
      refreshMaterialBinding();
    }, [materialBindingKey, refreshMaterialBinding]);

    useSpring({
      opacity: visible ? 1 : 0,
      immediate: !enabled,
      config: {
        duration: transition.duration,
        easing: easeInOutCubic,
      },
      onChange: result => {
        const value = result.value as { opacity?: number };
        applyOpacity(value.opacity ?? (visible ? 1 : 0));
      },
      onRest: () => {
        applyOpacity(visible ? 1 : 0);
        if (enabled && !visible) {
          if (keepMounted) {
            setGroupVisible(false);
          } else {
            setRendered(false);
          }
        }
      },
    });

    React.useEffect(() => restoreMaterialBinding, [restoreMaterialBinding]);

    if (!enabled) {
      return <Group {...groupProps} visible={visible} ref={forwardedRef}>
        {children}
      </Group>;
    }

    if (shouldUnmountFocusVisibilityGroup(rendered, visible, keepMounted)) {
      return undefined;
    }

    return <Group {...groupProps} visible={groupVisible} ref={setRef}>
      {children}
    </Group>;
  });

export const useFocusTransitionMount = (visible: boolean) => {
  const transition = useFocusTransition();
  const [mounted, setMounted] = React.useState(visible);

  React.useEffect(() => {
    if (transition.enabled && visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      return;
    }
    if (!transition.enabled) { return; }
    const timeout = window.setTimeout(() =>
      setMounted(false), transition.duration);
    return () => window.clearTimeout(timeout);
  }, [transition.duration, transition.enabled, visible]);

  return {
    ...transition,
    mounted: transition.enabled ? mounted || visible : visible,
  };
};

export const useFocusVisibilityClass = (visible: boolean) => {
  const transition = useFocusTransitionMount(visible);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (!transition.enabled) { return; }
    if (!transition.mounted) { return; }
    if (!visible) {
      const frame = window.requestAnimationFrame(() => setShown(false));
      return () => window.cancelAnimationFrame(frame);
    }
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setShown(true));
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [
    transition.enabled,
    transition.mounted,
    visible,
  ]);

  const visibleClass = transition.enabled
    ? visible && shown
    : visible;
  return {
    ...transition,
    className: visibleClass
      ? "focus-transition-visible"
      : "focus-transition-hidden",
  };
};

export interface FocusVisibilityDivProps
  extends React.HTMLAttributes<HTMLDivElement> {
  visible: boolean;
  className: string;
  children: React.ReactNode;
}

export const FocusVisibilityDiv = (props: FocusVisibilityDivProps) => {
  const {
    visible, className: incomingClassName, children, ...divProps
  } = props;
  const transition = useFocusVisibilityClass(visible);

  if (!transition.mounted) { return undefined; }
  const className = [
    incomingClassName,
    "focus-transition-dom",
    transition.className,
  ].join(" ");
  return <div {...divProps} className={className}>
    {children}
  </div>;
};

export interface SmoothCameraState extends Camera {
  zoom: number;
}

const vectorFromSpring = (value: unknown, fallback: VectorXyz): VectorXyz =>
  Array.isArray(value) && value.length == 3
    ? [Number(value[0]), Number(value[1]), Number(value[2])]
    : fallback;

export const cameraTransitionValue = (
  value: Partial<Record<keyof SmoothCameraState, unknown>>,
  fallback: SmoothCameraState,
): SmoothCameraState => ({
  position: vectorFromSpring(value.position, fallback.position),
  target: vectorFromSpring(value.target, fallback.target),
  zoom: typeof value.zoom == "number" ? value.zoom : fallback.zoom,
});

export const interpolateCameraState = (
  from: SmoothCameraState,
  to: SmoothCameraState,
  progress: number,
): SmoothCameraState => {
  const lerp = (start: number, end: number) =>
    start + (end - start) * progress;
  return {
    position: [
      lerp(from.position[0], to.position[0]),
      lerp(from.position[1], to.position[1]),
      lerp(from.position[2], to.position[2]),
    ],
    target: [
      lerp(from.target[0], to.target[0]),
      lerp(from.target[1], to.target[1]),
      lerp(from.target[2], to.target[2]),
    ],
    zoom: lerp(from.zoom, to.zoom),
  };
};

const cameraKey = (state: SmoothCameraState) =>
  [
    ...state.position,
    ...state.target,
    state.zoom,
  ].join(",");

export interface SmoothCameraObject {
  position: {
    x?: number;
    y?: number;
    z?: number;
    set(x: number, y: number, z: number): void;
    toArray?(): number[];
  };
  zoom: number;
  lookAt?(x: number, y: number, z: number): void;
  updateProjectionMatrix?(): void;
}

export interface SmoothCameraControls {
  target: {
    x?: number;
    y?: number;
    z?: number;
    set(x: number, y: number, z: number): void;
    toArray?(): number[];
  };
  update?(): void;
}

const readVector = (
  vector: SmoothCameraObject["position"] | SmoothCameraControls["target"] | undefined,
  fallback: VectorXyz,
): VectorXyz => {
  const values = vector?.toArray?.();
  if (values && values.length >= 3) {
    return [values[0], values[1], values[2]];
  }
  if (
    typeof vector?.x == "number"
    && typeof vector.y == "number"
    && typeof vector.z == "number"
  ) {
    return [vector.x, vector.y, vector.z];
  }
  return fallback;
};

export const readSmoothCameraState = (
  fallback: SmoothCameraState,
  cameraObject?: SmoothCameraObject | null,
  controls?: SmoothCameraControls | null,
): SmoothCameraState => ({
  position: readVector(cameraObject?.position, fallback.position),
  target: readVector(controls?.target, fallback.target),
  zoom: typeof cameraObject?.zoom == "number"
    ? cameraObject.zoom
    : fallback.zoom,
});

export const applySmoothCameraState = (
  state: SmoothCameraState,
  cameraObject?: SmoothCameraObject | null,
  controls?: SmoothCameraControls | null,
) => {
  if (cameraObject && typeof cameraObject.position?.set == "function") {
    setVector(cameraObject.position, state.position);
    cameraObject.zoom = state.zoom;
    cameraObject.updateProjectionMatrix?.();
    cameraObject.lookAt?.(...state.target);
  }
  if (controls && typeof controls.target?.set == "function") {
    setVector(controls.target, state.target);
    controls.update?.();
  }
};

export interface UseSmoothCameraProps {
  camera: Camera;
  zoom: number;
  enabled: boolean;
  cameraObject?: SmoothCameraObject | null;
  controls?: SmoothCameraControls | null;
}

export const useSmoothCamera = (props: UseSmoothCameraProps) => {
  const transition = useFocusTransition();
  const [positionX, positionY, positionZ] = props.camera.position;
  const [targetX, targetY, targetZ] = props.camera.target;
  const target = React.useMemo<SmoothCameraState>(() => ({
    position: [positionX, positionY, positionZ],
    target: [targetX, targetY, targetZ],
    zoom: props.zoom,
  }), [
    positionX,
    positionY,
    positionZ,
    props.zoom,
    targetX,
    targetY,
    targetZ,
  ]);
  const [displayCamera, setDisplayCamera] = React.useState(target);
  const displayRef = React.useRef(displayCamera);
  const key = cameraKey(target);

  React.useEffect(() => {
    displayRef.current = displayCamera;
  }, [displayCamera]);

  const appliedCamera = props.enabled ? displayCamera : target;
  React.useLayoutEffect(() => {
    applySmoothCameraState(
      appliedCamera,
      props.cameraObject,
      props.controls,
    );
  }, [
    appliedCamera,
    props.cameraObject,
    props.controls,
  ]);

  React.useEffect(() => {
    if (!props.enabled) {
      displayRef.current = target;
      applySmoothCameraState(
        target,
        props.cameraObject,
        props.controls,
      );
      return;
    }
    const from = readSmoothCameraState(
      displayRef.current,
      props.cameraObject,
      props.controls,
    );
    const startedAt = performance.now();
    let frame = 0;
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      const progress = Math.min(elapsed / transition.duration, 1);
      const next = interpolateCameraState(
        from,
        target,
        easeInOutCubic(progress),
      );
      displayRef.current = next;
      setDisplayCamera(next);
      applySmoothCameraState(next, props.cameraObject, props.controls);
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      } else {
        displayRef.current = target;
        setDisplayCamera(target);
        applySmoothCameraState(
          target,
          props.cameraObject,
          props.controls,
        );
      }
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [
    key,
    props.cameraObject,
    props.controls,
    props.enabled,
    target,
    transition.duration,
  ]);

  return props.enabled ? displayCamera : target;
};
