import React from "react";
import { shallow } from "enzyme";
import { TypePart } from "../type_part";
import { FBSelect } from "../../../../ui";
import { fakeAssertProps } from "../../__tests__/tile_assertion_test";

describe("<TypePart/>", () => {
  it("renders default verbiage and props", () => {
    const p = fakeAssertProps();
    const el = shallow(<TypePart {...p} />);
    el
      .find(FBSelect)
      .simulate("change", { value: "anything", label: "y" });
    expect(p.dispatch).toHaveBeenCalled();
    const calls = (p.dispatch as jest.Mock).mock.calls[0][0];
    const { assertion_type } = calls.payload.update.body[1].args;
    expect(assertion_type).toEqual("anything");
  });
});
