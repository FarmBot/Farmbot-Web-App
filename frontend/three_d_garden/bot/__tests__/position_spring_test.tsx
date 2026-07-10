import { act, renderHook } from "@testing-library/react";
import {
  BOT_POSITION_SPRING,
  MechanicalPositionState,
  stepMechanicalAxis,
  stepMechanicalPosition,
  useBotPositionSpring,
} from "../position_spring";
import { PositionConfig } from "../../config";

describe("bot position spring", () => {
  it("smoothly accelerates without exceeding its top speed", () => {
    const accelerated = stepMechanicalAxis(
      { position: 0, velocity: 0 },
      1000,
      1 / 30,
    );
    expect(accelerated.position).toBeGreaterThan(0);
    expect(accelerated.velocity).toBeGreaterThan(0);
    expect(accelerated.velocity).toBeLessThan(
      BOT_POSITION_SPRING.maxSpeed,
    );

    const capped = stepMechanicalAxis(
      { position: 100, velocity: BOT_POSITION_SPRING.maxSpeed - 1 },
      1000,
      1,
    );
    expect(capped.velocity).toEqual(BOT_POSITION_SPRING.maxSpeed);
  });

  it("smoothly decelerates and stops at the target without overshoot", () => {
    const decelerating = stepMechanicalAxis(
      { position: 900, velocity: BOT_POSITION_SPRING.maxSpeed },
      1000,
      1 / 30,
    );
    expect(decelerating.velocity).toBeLessThan(
      BOT_POSITION_SPRING.maxSpeed,
    );

    const stopped = stepMechanicalAxis(
      { position: 999, velocity: BOT_POSITION_SPRING.maxSpeed },
      1000,
      1 / 30,
    );
    expect(stopped).toEqual({ position: 1000, velocity: 0 });
  });

  it("settles at its target without bouncing", () => {
    const target = 1000;
    let state = { position: 0, velocity: 0 };
    let furthestPosition = state.position;
    for (let step = 0; step < 1000; step++) {
      state = stepMechanicalAxis(state, target, 1 / 60);
      furthestPosition = Math.max(furthestPosition, state.position);
    }
    expect(furthestPosition).toBeLessThanOrEqual(target);
    expect(state).toEqual({ position: target, velocity: 0 });
  });

  it("preserves velocity when retargeted during motion", () => {
    const moving = stepMechanicalAxis(
      { position: 0, velocity: 0 },
      1000,
      1 / 30,
    );
    const retargeted = stepMechanicalAxis(moving, -1000, 1 / 60);
    expect(retargeted.velocity).toBeGreaterThan(0);
    expect(retargeted.velocity).toBeLessThan(moving.velocity);
    expect(retargeted.position).toBeGreaterThan(moving.position);
  });

  it("advances all axes and ignores non-positive time steps", () => {
    const state: MechanicalPositionState = {
      position: { x: 0, y: 10, z: -10 },
      velocity: { x: 0, y: 0, z: 0 },
    };
    const target = { x: 100, y: 110, z: 90 };
    const next = stepMechanicalPosition(state, target, 1 / 60);
    expect(next.position.x).toBeGreaterThan(state.position.x);
    expect(next.position.y).toBeGreaterThan(state.position.y);
    expect(next.position.z).toBeGreaterThan(state.position.z);
    expect(stepMechanicalAxis(
      { position: 1, velocity: 2 },
      10,
      0,
    )).toEqual({ position: 1, velocity: 2 });
  });

  it("finishes as soon as the rounded coordinate reaches the target", () => {
    expect(stepMechanicalAxis(
      { position: 9.5, velocity: 100 },
      10,
      1 / 60,
    )).toEqual({ position: 10, velocity: 0 });
  });
});

describe("useBotPositionSpring()", () => {
  let callbacks: Map<number, FrameRequestCallback>;
  let nextFrameId: number;
  let requestFrameSpy: jest.SpyInstance;
  let cancelFrameSpy: jest.SpyInstance;

  const runNextFrame = (time: number) => {
    const entry = callbacks.entries().next().value;
    expect(entry).toBeTruthy();
    if (!entry) { return; }
    callbacks.delete(entry[0]);
    act(() => entry[1](time));
  };

  beforeEach(() => {
    callbacks = new Map();
    nextFrameId = 1;
    requestFrameSpy = jest.spyOn(window, "requestAnimationFrame")
      .mockImplementation(callback => {
        const id = nextFrameId++;
        callbacks.set(id, callback);
        return id;
      });
    cancelFrameSpy = jest.spyOn(window, "cancelAnimationFrame")
      .mockImplementation(id => {
        callbacks.delete(id);
      });
  });

  afterEach(() => {
    requestFrameSpy.mockRestore();
    cancelFrameSpy.mockRestore();
  });

  it("continues smoothly toward position updates received in flight", () => {
    const initial = { x: 0, y: 0, z: 0 };
    const { result, rerender, unmount } = renderHook(
      ({ target, enabled }: {
        target: PositionConfig;
        enabled: boolean;
      }) => useBotPositionSpring(target, enabled),
      { initialProps: { target: initial, enabled: true } },
    );
    expect(result.current).toEqual(initial);
    runNextFrame(0);
    expect(callbacks.size).toEqual(0);

    rerender({ target: { x: 100, y: 200, z: -100 }, enabled: true });
    runNextFrame(0);
    const firstPosition = result.current;
    expect(firstPosition.x).toBeGreaterThan(0);
    expect(firstPosition.y).toBeGreaterThan(0);
    expect(firstPosition.z).toBeLessThan(0);

    rerender({ target: { x: 200, y: 300, z: -200 }, enabled: true });
    runNextFrame(16);
    expect(result.current.x).toBeGreaterThan(firstPosition.x);
    expect(result.current.y).toBeGreaterThan(firstPosition.y);
    expect(result.current.z).toBeLessThan(firstPosition.z);
    unmount();
    expect(cancelFrameSpy).toHaveBeenCalled();
  });

  it("clears velocity immediately when reset", () => {
    const initial = { x: 0, y: 0, z: 0 };
    const { result, rerender } = renderHook(
      ({ target, resetKey }: {
        target: PositionConfig;
        resetKey: number;
      }) => useBotPositionSpring(target, true, {}, resetKey),
      { initialProps: { target: initial, resetKey: 0 } },
    );
    runNextFrame(0);
    rerender({ target: { x: 100, y: 0, z: 0 }, resetKey: 0 });
    let time = 0;
    for (let frame = 0; frame < 5; frame++) {
      time += 16;
      runNextFrame(time);
    }
    const movingPosition = result.current;
    expect(movingPosition.x).toBeGreaterThan(0);
    const stoppedPosition = { ...movingPosition, x: movingPosition.x - 2 };

    rerender({ target: stoppedPosition, resetKey: 1 });
    runNextFrame(time + 16);
    expect(result.current).toEqual(stoppedPosition);
    expect(callbacks.size).toEqual(0);
  });

  it("applies updates immediately when animation is disabled", () => {
    const onChange = jest.fn();
    const onRest = jest.fn();
    const { result, rerender } = renderHook(
      ({ target, enabled }: {
        target: PositionConfig;
        enabled: boolean;
      }) => useBotPositionSpring(target, enabled, { onChange, onRest }),
      {
        initialProps: {
          target: { x: 0, y: 0, z: 0 },
          enabled: true,
        },
      },
    );
    const target = { x: 100, y: 200, z: 300 };
    rerender({ target, enabled: false });
    expect(result.current).toEqual(target);
    runNextFrame(0);
    expect(callbacks.size).toEqual(0);
    expect(onChange).toHaveBeenLastCalledWith(target);
    expect(onRest).toHaveBeenLastCalledWith(target);
  });

  it("finishes on the exact target when the spring comes to rest", () => {
    const initial = { x: 0, y: 0, z: 0 };
    const onChange = jest.fn();
    const onRest = jest.fn();
    const { result, rerender } = renderHook(
      ({ target }: { target: PositionConfig }) =>
        useBotPositionSpring(target, true, { onChange, onRest }),
      { initialProps: { target: initial } },
    );
    runNextFrame(0);
    onChange.mockClear();
    onRest.mockClear();
    const target = { x: 1, y: 0, z: 0 };
    rerender({ target });
    let time = 0;
    let frameCount = 0;
    while (callbacks.size > 0 && frameCount < 500) {
      time += 16;
      frameCount++;
      runNextFrame(time);
    }
    expect(frameCount).toBeGreaterThan(1);
    expect(callbacks.size).toEqual(0);
    expect(result.current).toEqual(target);
    expect(onChange).toHaveBeenCalled();
    expect(onRest).toHaveBeenCalledTimes(1);
    expect(onRest).toHaveBeenCalledWith(target);
  });
});
