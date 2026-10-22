import { Actions } from "../../../constants";
import { store } from "../../../redux/store";
import {
  cancelDemoMovement,
  DEMO_POSITION_PUBLISH_INTERVAL_MS,
  demoMovementActive,
  getDemoMovementTarget,
  getDemoMovementSpeed,
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
    jest.setSystemTime(0);
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

  it("normalizes and copies speed, and clears it on cancellation", () => {
    unregisterMovementDriver = registerDemoMovementDriver();
    const speed = { x: 50, y: 0, z: Infinity };
    const cancel = startDemoMovement({ x: 100, y: 0, z: 0 }, jest.fn(), speed);
    speed.x = 75;
    const snapshot = getDemoMovementSpeed();
    expect(snapshot).toEqual({ x: 50, y: 1, z: 100 });
    if (snapshot) { snapshot.x = 25; }
    expect(getDemoMovementSpeed()?.x).toEqual(50);
    cancel();
    expect(getDemoMovementSpeed()).toBeUndefined();
    startDemoMovement({ x: 100, y: 0, z: 0 }, jest.fn());
    expect(getDemoMovementSpeed()).toEqual({ x: 100, y: 100, z: 100 });
    cancelDemoMovement();
    expect(getDemoMovementSpeed()).toBeUndefined();
  });

  it("uses the next move's speed when completion starts it synchronously", () => {
    unregisterMovementDriver = registerDemoMovementDriver();
    const nextSpeed = { x: 25, y: 50, z: 75 };
    startDemoMovement({ x: 100, y: 0, z: 0 }, () => {
      expect(getDemoMovementSpeed()).toBeUndefined();
      startDemoMovement({ x: 200, y: 0, z: 0 }, jest.fn(), nextSpeed);
    }, { x: 50, y: 50, z: 50 });
    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    expect(getDemoMovementSpeed()).toEqual(nextSpeed);
    reportDemoMovementComplete({ x: 200, y: 0, z: 0 });
    expect(getDemoMovementSpeed()).toBeUndefined();
  });

  it("completes asynchronously when no animation driver is mounted", () => {
    const onTargetReached = jest.fn();
    startDemoMovement({ x: 100, y: 200, z: 300 }, onTargetReached,
      { x: 50, y: 25, z: 75 });
    expect(getDemoMovementSpeed()).toEqual({ x: 50, y: 25, z: 75 });

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
    expect(getDemoMovementSpeed()).toBeUndefined();
  });

  it("cancels the pending fallback completion", () => {
    const onTargetReached = jest.fn();
    const target = { x: 100, y: 200, z: 300 };
    startDemoMovement(target, onTargetReached);

    expect(demoMovementActive()).toBeTruthy();
    expect(cancelDemoMovement()).toEqual({ x: 0, y: 0, z: 0 });
    jest.runAllTimers();

    expect(demoMovementActive()).toBeFalsy();
    expect(onTargetReached).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION, payload: target,
    });
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

    jest.advanceTimersByTime(Math.ceil(DEMO_POSITION_PUBLISH_INTERVAL_MS));
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

  it("limits progress publication to 30 Hz and publishes final position", () => {
    unregisterMovementDriver = registerDemoMovementDriver();
    const target = { x: 100, y: 200, z: 300 };
    startDemoMovement(target, jest.fn());
    mockDispatch.mockClear();

    reportDemoMovementPosition({ x: 10, y: 20, z: 30 });
    jest.setSystemTime(Math.ceil(DEMO_POSITION_PUBLISH_INTERVAL_MS) - 1);
    reportDemoMovementPosition({ x: 20, y: 30, z: 40 });
    expect(mockDispatch).not.toHaveBeenCalled();

    jest.setSystemTime(Math.ceil(DEMO_POSITION_PUBLISH_INTERVAL_MS));
    reportDemoMovementPosition({ x: 30, y: 40, z: 50 });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 30, y: 40, z: 50 },
    });

    reportDemoMovementComplete(target);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: target,
    });
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
