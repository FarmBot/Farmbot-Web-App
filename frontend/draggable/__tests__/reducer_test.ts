import { draggableReducer } from "../reducer";
import { DraggableState } from "../interfaces";
import { Actions } from "../../constants";

describe("draggableReducer", () => {
  function emptyState(): DraggableState {
    return {
      dataTransfer: {
        "BAR": {
          draggerId: 5,
          value: {
            kind: "wait",
            args: { milliseconds: 50 }
          },
          uuid: "BAR",
          intent: "step_splice"
        }
      }
    };
  }

  it("puts a step", () => {
    const payload = { uuid: "FOO" };
    const action = { type: Actions.PUT_DATA_XFER, payload };
    const nextState = draggableReducer(emptyState(), action);
    const dt = nextState.dataTransfer;
    expect(Object.keys(dt)).toContain(payload.uuid);
    const entry = dt[payload.uuid];
    expect(entry?.uuid).toEqual(payload.uuid);
  });

  it("drops a step", () => {
    const payload = "BAR";
    const action = { type: Actions.DROP_DATA_XFER, payload };
    const nextState = draggableReducer(emptyState(), action);
    expect(Object.keys(nextState.dataTransfer).length)
      .toEqual(0);
  });
});
