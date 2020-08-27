import React from "react";
import { shallow } from "enzyme";
import { TileAssertion } from "../tile_assertion";
import { LuaPart } from "../tile_assertion/lua_part";
import { TypePart } from "../tile_assertion/type_part";
import { SequencePart } from "../tile_assertion/sequence_part";
import { fakeAssertProps } from "../tile_assertion/test_fixtures";

describe("<TileAssertion />", () => {
  it("renders with sequence part", () => {
    const p = fakeAssertProps();
    p.currentStep.args.assertion_type = "recover";
    const wrapper = shallow(<TileAssertion {...p} />);
    expect(wrapper.find(LuaPart).length).toEqual(1);
    expect(wrapper.find(TypePart).length).toEqual(1);
    expect(wrapper.find(SequencePart).length).toEqual(1);
  });

  it("renders without sequence part", () => {
    const p = fakeAssertProps();
    p.currentStep.args.assertion_type = "abort";
    const wrapper = shallow(<TileAssertion {...p} />);
    expect(wrapper.find(LuaPart).length).toEqual(1);
    expect(wrapper.find(TypePart).length).toEqual(1);
    expect(wrapper.find(SequencePart).length).toEqual(0);
  });
});
