import { Actions } from "../../../constants";
import { store } from "../../../redux/store";
import {
  cancelDemoMovement,
  demoMovementActive,
  getDemoMovementTarget,
  registerDemoMovementDriver,
  reportDemoMovementComplete,
  reportDemoMovementPosition,
  startDemoMovement,
} from "../movement";

const originalDispatch = store.dispatch;
const originalGetState = store.getState;
const mockDispatch = jest.fn();
const mockGetState = () => ({
  bot: {
    hardware: {
      location_data: { position: { x: 0, y: 0, z: 0 } },
    },
  },
});

describe("demo movement coordinator", () => {
  let unregisterMovementDriver: (() => void) | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (store as unknown as { dispatch: Function }).dispatch = mockDispatch;
    (store as unknown as { getState: Function }).getState = mockGetState;
    cancelDemoMovement();
    const clearPosition = registerDemoMovementDriver();
    clearPosition();
    unregisterMovementDriver = undefined;
  });

  afterEach(() => {
    unregisterMovementDriver?.();
    cancelDemoMovement();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  afterAll(() => {
    (store as unknown as { dispatch: Function }).dispatch = originalDispatch;
    (store as unknown as { getState: Function }).getState = originalGetState;
  });

  it("completes asynchronously when no animation driver is mounted", () => {
    const onTargetReached = jest.fn();
    startDemoMovement({ x: 100, y: 200, z: 300 }, onTargetReached);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
    expect(onTargetReached).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 100, y: 200, z: 300 },
    });
    expect(onTargetReached).toHaveBeenCalledTimes(1);
    expect(demoMovementActive()).toBeFalsy();
  });

  it("waits for a mounted driver to report the matching target", () => {
    unregisterMovementDriver = registerDemoMovementDriver();
    const onTargetReached = jest.fn();
    startDemoMovement({ x: 100, y: 0, z: 0 }, onTargetReached);

    jest.runAllTimers();
    reportDemoMovementComplete({ x: 99, y: 0, z: 0 });
    expect(onTargetReached).not.toHaveBeenCalled();
    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    expect(onTargetReached).toHaveBeenCalledTimes(1);
  });

  it("publishes progress without replacing the commanded target", () => {
    unregisterMovementDriver = registerDemoMovementDriver();
    const onTargetReached = jest.fn();
    const target = { x: 100, y: 200, z: 300 };
    startDemoMovement(target, onTargetReached);

    reportDemoMovementPosition({ x: 40, y: 50, z: 60 });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 40, y: 50, z: 60 },
    });
    expect(getDemoMovementTarget()).toEqual(target);
    expect(onTargetReached).not.toHaveBeenCalled();

    reportDemoMovementComplete(target);
    expect(getDemoMovementTarget()).toBeUndefined();
    expect(onTargetReached).toHaveBeenCalledTimes(1);
  });

  it("completes a zero-distance movement without waiting for a rerender", () => {
    unregisterMovementDriver = registerDemoMovementDriver();
    const onTargetReached = jest.fn();
    reportDemoMovementPosition({ x: 100, y: 0, z: 0 });
    startDemoMovement({ x: 100, y: 0, z: 0 }, onTargetReached);

    jest.runAllTimers();
    expect(onTargetReached).toHaveBeenCalledTimes(1);
  });

  it("completes when the last animation driver unmounts", () => {
    unregisterMovementDriver = registerDemoMovementDriver();
    const onTargetReached = jest.fn();
    startDemoMovement({ x: 100, y: 0, z: 0 }, onTargetReached);

    unregisterMovementDriver();
    unregisterMovementDriver = undefined;
    jest.runAllTimers();
    expect(onTargetReached).toHaveBeenCalledTimes(1);
  });

  it("cancels a movement and ignores its stale completion", () => {
    unregisterMovementDriver = registerDemoMovementDriver();
    const onTargetReached = jest.fn();
    const cancel = startDemoMovement(
      { x: 100, y: 0, z: 0 },
      onTargetReached,
    );
    reportDemoMovementPosition({ x: 40, y: 0, z: 0 });

    cancel();
    expect(cancelDemoMovement()).toEqual({ x: 40, y: 0, z: 0 });
    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    expect(onTargetReached).not.toHaveBeenCalled();
  });
});
