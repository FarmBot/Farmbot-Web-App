jest.mock("../../api/crud", () => ({ edit: jest.fn() }));

import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { NULL_CHOICE } from "../../ui";
import { fakeToolSlot } from "../../__test_support__/fake_state/resources";
import { edit } from "../../api/crud";

describe("mapStateToProps()", () => {
  it("getChosenToolOption()", () => {
    const props = mapStateToProps(fakeState());
    const result = props.getChosenToolOption(undefined);
    expect(result).toEqual(NULL_CHOICE);
  });

  it("changeToolSlot(): no tool_id", () => {
    const props = mapStateToProps(fakeState());
    const tool = fakeToolSlot();
    props.changeToolSlot(tool, jest.fn())({ label: "", value: "" });
    // tslint:disable-next-line:no-null-keyword
    expect(edit).toHaveBeenCalledWith(tool, { tool_id: null });
  });

  it("changeToolSlot(): tool_id", () => {
    const props = mapStateToProps(fakeState());
    const tool = fakeToolSlot();
    props.changeToolSlot(tool, jest.fn())({ label: "", value: 1 });
    expect(edit).toHaveBeenCalledWith(tool, { tool_id: 1 });
  });
});
