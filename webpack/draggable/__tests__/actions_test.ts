import { stepGet } from "../actions";
import { fakeState } from "../../__test_support__/fake_state";
import { DataXfer } from "../interfaces";

describe("stepGet()", () => {
  const state = fakeState();
  const dataXferObj: DataXfer = {
    draggerId: 0,
    uuid: "stepUuid",
    intent: "step_splice",
    value: { kind: "take_photo", args: {} }
  };
  state.draggable.dataTransfer = { "stepUuid": dataXferObj };

  it("gets step", () => {
    const step = stepGet("stepUuid")(jest.fn(), () => state);
    expect(step).toEqual(dataXferObj);
  });

  it("handles bad UUID", () => {
    const badUuid = () => stepGet("bad")(jest.fn(), () => state);
    expect(badUuid).toThrow("Can't find StepXferObject with UUID bad");
  });
});
