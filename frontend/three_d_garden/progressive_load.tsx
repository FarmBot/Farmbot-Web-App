import React from "react";
import { animated, useSpring } from "@react-spring/three";
import { Html } from "@react-three/drei";
import { Group } from "./components";
import { Object3D } from "three";
import { createFocusMaterialBinding } from "./focus_transition";

const AnimatedGroup = animated(Group);

export const THREE_D_LOAD_STEPS = [
  { id: "environment", label: "Loading environment" },
  { id: "bed", label: "Loading bed and soil" },
  { id: "grid", label: "Loading grid" },
  { id: "plants", label: "Loading plants" },
  { id: "weeds", label: "Loading weeds" },
  { id: "points", label: "Loading points" },
  { id: "farmbot", label: "Loading FarmBot" },
  { id: "details", label: "Loading scene details" },
] as const;

export const THREE_D_LOAD_PROGRESS_FADE_MS = 300;

export type ThreeDLoadStepId = typeof THREE_D_LOAD_STEPS[number]["id"];
type ReadyStepTimes = Partial<Record<ThreeDLoadStepId, number>>;
type StepDependencies = Record<ThreeDLoadStepId, ThreeDLoadStepId[]>;

export const THREE_D_LOAD_STEP_DEPENDENCIES: StepDependencies = {
  environment: [],
  bed: ["environment"],
  grid: ["bed"],
  plants: ["grid"],
  weeds: ["grid"],
  points: ["grid"],
  farmbot: ["grid"],
  details: ["farmbot"],
};

interface ReadyAction {
  step: ThreeDLoadStepId;
  elapsed: number;
}

const readyStepReducer =
  (state: ReadyStepTimes, action: ReadyAction): ReadyStepTimes =>
    state[action.step] === undefined
      ? { ...state, [action.step]: action.elapsed }
      : state;

const now = () =>
  typeof performance == "undefined" ? Date.now() : performance.now();

export interface ThreeDLoadProgress {
  readyStepTimes: ReadyStepTimes;
  currentStep: typeof THREE_D_LOAD_STEPS[number] | undefined;
  progress: number;
  complete: boolean;
  markStep(step: ThreeDLoadStepId): void;
  isStepAllowed(step: ThreeDLoadStepId): boolean;
}

const rounded = (value: number | undefined) => Math.round(value || 0);

export const useThreeDLoadProgress = (): ThreeDLoadProgress => {
  const startTimeRef = React.useRef(now());
  const loggedRef = React.useRef(false);
  const [readyStepTimes, dispatch] =
    React.useReducer(readyStepReducer, {} as ReadyStepTimes);

  const markStep = React.useCallback((step: ThreeDLoadStepId) => {
    dispatch({ step, elapsed: now() - startTimeRef.current });
  }, []);

  const isStepAllowed = React.useCallback((step: ThreeDLoadStepId) => {
    return THREE_D_LOAD_STEP_DEPENDENCIES[step]
      .every(stepId => readyStepTimes[stepId] !== undefined);
  }, [readyStepTimes]);

  const readyStepCount =
    THREE_D_LOAD_STEPS.filter(step => readyStepTimes[step.id] !== undefined)
      .length;
  const currentStep =
    THREE_D_LOAD_STEPS.find(step => readyStepTimes[step.id] === undefined);
  const complete = readyStepCount == THREE_D_LOAD_STEPS.length;
  const progress = readyStepCount / THREE_D_LOAD_STEPS.length * 100;

  React.useEffect(() => {
    if (!complete || loggedRef.current) { return; }
    loggedRef.current = true;
    let totalElapsed = 0;
    THREE_D_LOAD_STEPS.forEach(step => {
      const elapsed = readyStepTimes[step.id] || 0;
      totalElapsed = Math.max(totalElapsed, elapsed);
      console.log(`[3D load] ${step.label}: ${rounded(elapsed)}ms`);
    });
    console.log(`[3D load] Total: ${rounded(totalElapsed)}ms`);
  }, [complete, readyStepTimes]);

  return React.useMemo(() => ({
    readyStepTimes,
    currentStep,
    progress,
    complete,
    markStep,
    isStepAllowed,
  }), [
    complete,
    currentStep,
    isStepAllowed,
    markStep,
    progress,
    readyStepTimes,
  ]);
};

interface LoadStepReadyProps {
  step: ThreeDLoadStepId;
  markStep(step: ThreeDLoadStepId): void;
}

export const LoadStepReady = (props: LoadStepReadyProps) => {
  const { markStep, step } = props;
  React.useEffect(() => {
    markStep(step);
  }, [markStep, step]);
  return undefined;
};

interface ThreeDLoadProgressOverlayProps {
  progress: ThreeDLoadProgress;
}

export const ThreeDLoadProgressOverlay =
  (props: ThreeDLoadProgressOverlayProps) => {
    const [mounted, setMounted] = React.useState(!props.progress.complete);

    React.useEffect(() => {
      if (!props.progress.complete) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        return;
      }
      const timeout = window.setTimeout(() =>
        setMounted(false), THREE_D_LOAD_PROGRESS_FADE_MS);
      return () => window.clearTimeout(timeout);
    }, [props.progress.complete]);

    if (!mounted) { return undefined; }
    const className = [
      "three-d-load-progress",
      props.progress.complete ? "three-d-load-progress-complete" : "",
    ].join(" ");
    return <Html fullscreen={true}>
      <div className={className}>
        <div className={"three-d-load-progress-bar"}
          aria-hidden={true}>
          <div className={"three-d-load-progress-fill"}
            style={{ width: `${props.progress.progress}%` }} />
        </div>
        <p>{props.progress.complete ? "Enjoy!" : props.progress.currentStep?.label}</p>
      </div>
    </Html>;
  };

const loadInConfig = {
  tension: 220,
  friction: 26,
};

export const botLoadInConfig = {
  tension: 220,
  friction: 30,
  clamp: true,
};

type LoadInSpringConfig = typeof loadInConfig & {
  clamp?: boolean;
};

const canTraverse = (value: unknown): value is Object3D =>
  !!value
  && typeof value == "object"
  && typeof (value as Object3D).traverse == "function";

interface LoadInGroupProps {
  name: string;
  children: React.ReactNode;
  onRest?: () => void;
  config?: LoadInSpringConfig;
  fromPosition?: [number, number, number];
  toPosition?: [number, number, number];
  fromScale?: number | [number, number, number];
  toScale?: number | [number, number, number];
  fadeIn?: boolean;
  preserveDepthWrite?: boolean;
}

export const LoadInGroup = (props: LoadInGroupProps) => {
  const fromPosition = props.fromPosition || [0, 0, 0];
  const toPosition = props.toPosition || [0, 0, 0];
  const fromScale = props.fromScale || 1;
  const toScale = props.toScale || 1;
  const groupRef = React.useRef<Object3D | undefined>(undefined);
  const opacityRef = React.useRef(props.fadeIn ? 0 : 1);
  const materialBinding = React.useRef<ReturnType<
    typeof createFocusMaterialBinding
  > | undefined>(undefined);
  const applyOpacity = React.useCallback((opacity: number) => {
    opacityRef.current = opacity;
    if (!props.fadeIn || !canTraverse(groupRef.current)) { return; }
    materialBinding.current ||= createFocusMaterialBinding(groupRef.current, {
      preserveDepthWrite: props.preserveDepthWrite,
    });
    materialBinding.current.apply(opacity);
  }, [props.fadeIn, props.preserveDepthWrite]);
  const setRef = React.useCallback((value: Object3D | null) => {
    groupRef.current = value || undefined;
  }, []);
  const restoreMaterialBinding = React.useCallback(() => {
    materialBinding.current?.restore();
    materialBinding.current = undefined;
  }, []);

  const { position, scale } = useSpring({
    from: {
      position: fromPosition,
      scale: fromScale,
      opacity: props.fadeIn ? 0 : 1,
    },
    to: {
      position: toPosition,
      scale: toScale,
      opacity: 1,
    },
    onChange: result => {
      const value = result.value as { opacity?: number };
      applyOpacity(value.opacity ?? 1);
    },
    onRest: () => {
      applyOpacity(1);
      restoreMaterialBinding();
      props.onRest?.();
    },
    config: props.config || loadInConfig,
  });

  React.useLayoutEffect(() => {
    if (!props.fadeIn) { return; }
    applyOpacity(opacityRef.current);
  }, [applyOpacity, props.fadeIn]);

  React.useEffect(() => restoreMaterialBinding, [restoreMaterialBinding]);

  return <AnimatedGroup
    ref={setRef}
    name={props.name}
    position={position}
    scale={scale}>
    {props.children}
  </AnimatedGroup>;
};

interface PopInGroupProps {
  name: string;
  children: React.ReactNode;
  onRest?: () => void;
  distance?: number;
}

export const PopInGroup = (props: PopInGroupProps) =>
  <LoadInGroup
    name={props.name}
    onRest={props.onRest}
    fromPosition={[0, 0, -(props.distance || 300)]}
    fromScale={[0.96, 0.96, 0.05]}
    toScale={[1, 1, 1]}>
    {props.children}
  </LoadInGroup>;

interface FallInGroupProps {
  name: string;
  children: React.ReactNode;
  onRest?: () => void;
  config?: LoadInSpringConfig;
  distance?: number;
  fadeIn?: boolean;
  preserveDepthWrite?: boolean;
}

export const FallInGroup = (props: FallInGroupProps) =>
  <LoadInGroup
    name={props.name}
    onRest={props.onRest}
    config={props.config}
    fromPosition={[0, 0, props.distance || 3000]}
    fromScale={1.02}
    toScale={1}
    fadeIn={props.fadeIn}
    preserveDepthWrite={props.preserveDepthWrite}>
    {props.children}
  </LoadInGroup>;

interface GridRevealGroupProps {
  name: string;
  children: React.ReactNode;
  onRest?: () => void;
}

export const GridRevealGroup = (props: GridRevealGroupProps) =>
  <LoadInGroup
    name={props.name}
    onRest={props.onRest}
    fromScale={[0.001, 0.001, 1]}
    toScale={[1, 1, 1]}>
    {props.children}
  </LoadInGroup>;
