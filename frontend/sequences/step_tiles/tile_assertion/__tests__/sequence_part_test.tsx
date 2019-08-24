import React from "react";
import { shallow } from "enzyme";
import { SequencePart } from "../sequence_part";
import { SequenceSelectBox } from "../../../sequence_select_box";
import { fakeAssertProps } from "../../__tests__/tile_assertion_test";

describe("<SequencePart/>", () => {
  it("renders default verbiage and props", () => {
    const p = fakeAssertProps();
    const el = shallow(<SequencePart {...p} />);
    el
      .find(SequenceSelectBox)
      .simulate("change", { value: 246, label: "y" });
    expect(p.dispatch).toHaveBeenCalled();
    const calls = (p.dispatch as jest.Mock).mock.calls[0][0];
    const { sequence_id } = calls.payload.update.body[1].args._then.args;
    expect(sequence_id).toEqual(246);
  });
});
