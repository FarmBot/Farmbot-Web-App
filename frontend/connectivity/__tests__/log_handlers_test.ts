import {
  onLogs, parseMovementLog, setMovementState, setMovementStateFromPosition,
} from "../log_handlers";
import { Log } from "farmbot/dist/resources/api_resources";
import { fakeState } from "../../__test_support__/fake_state";
import { Actions } from "../../constants";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { MovementState } from "../../interfaces";

describe("onLogs()", () => {
  it("inits log", () => {
    const msg = { message: "test log", type: undefined, channels: [] };
    const dispatch = jest.fn();
    const log = onLogs(dispatch, fakeState)(msg as unknown as Log);
    expect(log).toEqual(expect.objectContaining({
      body: expect.objectContaining({ type: "info" })
    }));
  });
});

describe("parseMovementLog()", () => {
  it("sets movement state", () => {
    const dispatch = jest.fn();
    const log = fakeLog().body;
    log.message = "Moving to (1.23, 2.34, 3.45)";
    parseMovementLog(log, mockDispatch(dispatch));
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.START_MOVEMENT,
      payload: {
        start: { x: 1, y: 2, z: 3 },
        distance: { x: 0.23, y: 0.34, z: 0.45 },
      }
    });
  });

  it("doesn't set movement state", () => {
    const dispatch = jest.fn();
    const log = fakeLog().body;
    log.message = "Not moving.";
    parseMovementLog(log, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("setMovementState()", () => {
  it("sets movement state", () => {
    const dispatch = jest.fn();
    const payload: MovementState = {
      start: { x: 0, y: 0, z: 0 },
      distance: { x: 0, y: 0, z: 0 },
    };
    setMovementState(payload)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.START_MOVEMENT, payload
    });
  });
});

describe("setMovementStateFromPosition()", () => {
  it("sets movement state", () => {
    const dispatch = jest.fn();
    setMovementStateFromPosition()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.START_MOVEMENT, payload: {
        start: { x: undefined, y: undefined, z: undefined },
        distance: { x: 0, y: 0, z: 0 },
      }
    });
  });
});
