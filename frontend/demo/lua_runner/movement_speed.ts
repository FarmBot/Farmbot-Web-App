import { Action, XyzNumber } from "./interfaces";

export const normalizeMovementSpeed = (speed: unknown): number => {
  if (typeof speed != "number" || !Number.isFinite(speed)) { return 100; }
  return Math.max(1, Math.min(100, speed));
};

export const movementSpeed = (speed: unknown): XyzNumber => {
  const percentage = normalizeMovementSpeed(speed);
  return { x: percentage, y: percentage, z: percentage };
};

export const getActionMovementSpeed = (action: Action): XyzNumber | undefined => {
  if (action.speed) { return action.speed; }
  if (action.args[3] === undefined) { return undefined; }
  return movementSpeed(action.args[3]);
};
