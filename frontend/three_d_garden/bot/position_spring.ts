import React from "react";
import { PositionConfig } from "../config";

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

export const useBotPositionSpring = (
  target: PositionConfig,
  enabled: boolean,
  callbacks: BotPositionSpringCallbacks = {},
  resetKey = 0,
): PositionConfig => {
  const motion = React.useRef(positionState(target));
  const resetKeyRef = React.useRef(resetKey);
  const [position, setPosition] = React.useState(target);
  const { x: targetX, y: targetY, z: targetZ } = target;
  const { onChange, onRest } = callbacks;

  React.useEffect(() => {
    const springTarget = { x: targetX, y: targetY, z: targetZ };
    const reset = resetKeyRef.current != resetKey;
    resetKeyRef.current = resetKey;
    if (reset || !enabled || positionAtRest(motion.current, springTarget)) {
      motion.current = positionState(springTarget);
      const frame = window.requestAnimationFrame(() => {
        setPosition(springTarget);
        onChange?.(springTarget);
        onRest?.(springTarget);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    let frame = 0;
    let previousTime: number | undefined;
    const tick = (time: number) => {
      const deltaSeconds = previousTime === undefined
        ? 1 / 60
        : (time - previousTime) / 1000;
      previousTime = time;
      const next = stepMechanicalPosition(
        motion.current,
        springTarget,
        deltaSeconds,
      );
      motion.current = next;
      onChange?.(next.position);
      if (positionAtRest(next, springTarget)) {
        motion.current = positionState(springTarget);
        setPosition(springTarget);
        onRest?.(springTarget);
      } else {
        setPosition(next.position);
        frame = window.requestAnimationFrame(tick);
      }
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [enabled, onChange, onRest, resetKey, targetX, targetY, targetZ]);

  return enabled ? position : target;
};
