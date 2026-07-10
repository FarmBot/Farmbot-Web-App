import React from "react";
import { useFrame } from "@react-three/fiber";
import { PositionConfig } from "../config";
import { perfCount } from "../../performance/perf";

// Millimetres and seconds; damping is critical for unit mass.
export const BOT_POSITION_SPRING = {
  stiffness: 20,
  damping: 8,
  maxAcceleration: 2000,
  maxSpeed: 800,
  maxDeltaTime: 1 / 30,
};

export interface MechanicalAxisState {
  position: number;
  velocity: number;
}

export interface MechanicalPositionState {
  position: PositionConfig;
  velocity: PositionConfig;
}

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

const axisAtRest = (state: MechanicalAxisState, target: number) =>
  Math.round(state.position) == Math.round(target);

export const stepMechanicalAxis = (
  state: MechanicalAxisState,
  target: number,
  deltaSeconds: number,
): MechanicalAxisState => {
  if (axisAtRest(state, target)) {
    return { position: target, velocity: 0 };
  }
  if (deltaSeconds <= 0) { return state; }
  const delta = Math.min(deltaSeconds, BOT_POSITION_SPRING.maxDeltaTime);
  const distance = target - state.position;
  const springAcceleration =
    BOT_POSITION_SPRING.stiffness * distance -
    BOT_POSITION_SPRING.damping * state.velocity;
  const acceleration = clamp(
    springAcceleration,
    BOT_POSITION_SPRING.maxAcceleration,
  );
  const velocity = clamp(
    state.velocity + acceleration * delta,
    BOT_POSITION_SPRING.maxSpeed,
  );
  const position = state.position +
    (state.velocity + velocity) * delta / 2;
  const remainingDistance = target - position;
  if (Math.round(position) == Math.round(target) ||
    distance * remainingDistance <= 0) {
    return { position: target, velocity: 0 };
  }
  return { position, velocity };
};

const axisState = (
  state: MechanicalPositionState,
  axis: keyof PositionConfig,
): MechanicalAxisState => ({
  position: state.position[axis],
  velocity: state.velocity[axis],
});

export const stepMechanicalPosition = (
  state: MechanicalPositionState,
  target: PositionConfig,
  deltaSeconds: number,
): MechanicalPositionState => {
  const x = stepMechanicalAxis(axisState(state, "x"), target.x, deltaSeconds);
  const y = stepMechanicalAxis(axisState(state, "y"), target.y, deltaSeconds);
  const z = stepMechanicalAxis(axisState(state, "z"), target.z, deltaSeconds);
  return {
    position: { x: x.position, y: y.position, z: z.position },
    velocity: { x: x.velocity, y: y.velocity, z: z.velocity },
  };
};

const positionState = (position: PositionConfig): MechanicalPositionState => ({
  position,
  velocity: { x: 0, y: 0, z: 0 },
});

const positionAtRest = (
  state: MechanicalPositionState,
  target: PositionConfig,
) =>
  axisAtRest(axisState(state, "x"), target.x) &&
  axisAtRest(axisState(state, "y"), target.y) &&
  axisAtRest(axisState(state, "z"), target.z);

export interface BotPositionSpringCallbacks {
  onChange?(position: PositionConfig): void;
  onRest?(position: PositionConfig): void;
}

export interface BotPositionSpringResult {
  snapshotStore: BotPositionSnapshotStore;
  currentPosition: React.MutableRefObject<PositionConfig>;
}

export interface BotPositionSnapshotStore {
  getSnapshot(): PositionConfig;
  subscribe(listener: () => void): () => void;
  publish(position: PositionConfig): void;
}

const copyPosition = (position: PositionConfig): PositionConfig => ({
  x: position.x,
  y: position.y,
  z: position.z,
});

export const createBotPositionSnapshotStore = (
  initialPosition: PositionConfig,
): BotPositionSnapshotStore => {
  let snapshot = copyPosition(initialPosition);
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    publish: position => {
      snapshot = copyPosition(position);
      listeners.forEach(listener => listener());
    },
  };
};

export const useBotPositionSnapshot = (
  store: BotPositionSnapshotStore,
): PositionConfig => React.useSyncExternalStore(
  store.subscribe,
  store.getSnapshot,
  store.getSnapshot,
);

export const useBotPositionSpring = (
  target: PositionConfig,
  enabled: boolean,
  callbacks: BotPositionSpringCallbacks = {},
  resetKey = 0,
): BotPositionSpringResult => {
  const [initialPosition] = React.useState(() => copyPosition(target));
  const motion = React.useRef(positionState(initialPosition));
  const targetRef = React.useRef(initialPosition);
  const enabledRef = React.useRef(enabled);
  const callbacksRef = React.useRef(callbacks);
  const resetKeyRef = React.useRef(resetKey);
  const currentPosition = React.useRef(initialPosition);
  const lastSnapshot = React.useRef(initialPosition);
  const [snapshotStore] = React.useState(
    () => createBotPositionSnapshotStore(initialPosition),
  );
  const { x: targetX, y: targetY, z: targetZ } = target;

  const publishSnapshot = React.useCallback((position: PositionConfig) => {
    if (position.x === lastSnapshot.current.x &&
      position.y === lastSnapshot.current.y &&
      position.z === lastSnapshot.current.z) {
      return false;
    }
    const snapshot = copyPosition(position);
    lastSnapshot.current = snapshot;
    perfCount("bot.routingSnapshot");
    snapshotStore.publish(snapshot);
    return true;
  }, [snapshotStore]);

  React.useLayoutEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  React.useLayoutEffect(() => {
    const springTarget = { x: targetX, y: targetY, z: targetZ };
    const reset = resetKeyRef.current != resetKey;
    resetKeyRef.current = resetKey;
    targetRef.current = springTarget;
    enabledRef.current = enabled;
    if (reset || !enabled || positionAtRest(motion.current, springTarget)) {
      motion.current = positionState(springTarget);
      currentPosition.current = springTarget;
      callbacksRef.current.onChange?.(springTarget);
      publishSnapshot(springTarget);
      callbacksRef.current.onRest?.(springTarget);
    }
  }, [
    enabled,
    publishSnapshot,
    resetKey,
    targetX,
    targetY,
    targetZ,
  ]);

  useFrame((_state, deltaSeconds) => {
    if (!enabledRef.current ||
      positionAtRest(motion.current, targetRef.current)) {
      return;
    }
    const next = stepMechanicalPosition(
      motion.current,
      targetRef.current,
      deltaSeconds,
    );
    motion.current = next;
    currentPosition.current = next.position;
    callbacksRef.current.onChange?.(next.position);
    if (positionAtRest(next, targetRef.current)) {
      const exactTarget = copyPosition(targetRef.current);
      motion.current = positionState(exactTarget);
      currentPosition.current = exactTarget;
      publishSnapshot(exactTarget);
      callbacksRef.current.onRest?.(exactTarget);
    } else {
      publishSnapshot(next.position);
    }
  }, -1);

  return { snapshotStore, currentPosition };
};
