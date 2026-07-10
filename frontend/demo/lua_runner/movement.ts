import { Actions } from "../../constants";
import { store } from "../../redux/store";
import { XyzNumber } from "./interfaces";

const POSITION_EPSILON = 0.01;

interface ActiveMovement {
  id: number;
  target: XyzNumber;
  onTargetReached(): void;
  fallbackTimer?: ReturnType<typeof setTimeout>;
}

let activeMovement: ActiveMovement | undefined;
let driverCount = 0;
let movementId = 0;
let stopVersion = 0;
let renderedPosition: XyzNumber | undefined;

const positionsMatch = (a: XyzNumber, b: XyzNumber) =>
  Math.abs(a.x - b.x) < POSITION_EPSILON &&
  Math.abs(a.y - b.y) < POSITION_EPSILON &&
  Math.abs(a.z - b.z) < POSITION_EPSILON;

const getStorePosition = (): XyzNumber | undefined => {
  const position = store.getState().bot.hardware.location_data?.position;
  if (typeof position?.x != "number" ||
    typeof position.y != "number" ||
    typeof position.z != "number") { return undefined; }
  return { x: position.x, y: position.y, z: position.z };
};

const finishMovement = (id: number) => {
  if (activeMovement?.id != id) { return; }
  const movement = activeMovement;
  activeMovement = undefined;
  movement.fallbackTimer && clearTimeout(movement.fallbackTimer);
  renderedPosition = { ...movement.target };
  store.dispatch({
    type: Actions.DEMO_SET_POSITION,
    payload: movement.target,
  });
  movement.onTargetReached();
};

const finishMovementSoon = (movement: ActiveMovement) => {
  movement.fallbackTimer = setTimeout(() =>
    finishMovement(movement.id), 0);
};

export const registerDemoMovementDriver = () => {
  driverCount++;
  return () => {
    driverCount = Math.max(driverCount - 1, 0);
    if (driverCount === 0 && activeMovement) {
      finishMovementSoon(activeMovement);
    } else if (driverCount === 0) {
      renderedPosition = undefined;
    }
  };
};

export const reportDemoMovementPosition = (position: XyzNumber) => {
  renderedPosition = { ...position };
  if (activeMovement) {
    store.dispatch({
      type: Actions.DEMO_SET_POSITION,
      payload: position,
    });
  }
};

export const reportDemoMovementComplete = (position: XyzNumber) => {
  reportDemoMovementPosition(position);
  if (activeMovement && positionsMatch(position, activeMovement.target)) {
    finishMovement(activeMovement.id);
  }
};

export const startDemoMovement = (
  target: XyzNumber,
  onTargetReached: () => void,
) => {
  const startingPosition = renderedPosition || getStorePosition();
  const movement: ActiveMovement = {
    id: ++movementId,
    target: { ...target },
    onTargetReached,
  };
  activeMovement = movement;
  store.dispatch({
    type: Actions.DEMO_SET_POSITION,
    payload: startingPosition || target,
  });
  if (driverCount === 0 ||
    !!startingPosition && positionsMatch(startingPosition, target)) {
    finishMovementSoon(movement);
  }
  return () => {
    if (activeMovement?.id != movement.id) { return; }
    movement.fallbackTimer && clearTimeout(movement.fallbackTimer);
    activeMovement = undefined;
    movementId++;
  };
};

export const cancelDemoMovement = (): XyzNumber | undefined => {
  movementId++;
  stopVersion++;
  activeMovement?.fallbackTimer &&
    clearTimeout(activeMovement.fallbackTimer);
  activeMovement = undefined;
  const position = renderedPosition || getStorePosition();
  return position && { ...position };
};

export const demoMovementActive = () => !!activeMovement;

export const getDemoMovementTarget = (): XyzNumber | undefined =>
  activeMovement && { ...activeMovement.target };

export const getDemoMovementStopVersion = () => stopVersion;
