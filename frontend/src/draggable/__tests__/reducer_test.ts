import { draggableReducer } from "../reducer";
import { DraggableState } from "../interfaces";

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
    let payload = { uuid: "FOO" };
    let action = { type: "PUT_DATA_XFER", payload };
    let nextState = draggableReducer(emptyState(), action);
    let dt = nextState.dataTransfer;
    expect(Object.keys(dt)).toContain(payload.uuid);
    let entry = dt[payload.uuid];
    expect(entry && entry.uuid).toEqual(payload.uuid);
  });

  it("drops a step", () => {
    let payload = "BAR";
    let action = { type: "DROP_DATA_XFER", payload };
    let nextState = draggableReducer(emptyState(), action);
    expect(Object.keys(nextState.dataTransfer).length)
      .toEqual(0);
  });
})
