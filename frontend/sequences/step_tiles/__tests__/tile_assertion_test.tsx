import React from "react";
import { mount, shallow } from "enzyme";
import { TileAssertion } from "../tile_assertion";
import { TypePart } from "../tile_assertion/type_part";
import { SequencePart } from "../tile_assertion/sequence_part";
import { fakeAssertProps } from "../tile_assertion/test_fixtures";
import { LuaTextArea } from "../tile_lua_support";

describe("<TileAssertion />", () => {
  it("renders with sequence part", () => {
    const p = fakeAssertProps();
    p.currentStep.args.assertion_type = "recover";
    const wrapper = shallow(<TileAssertion {...p} />);
    expect(wrapper.find(LuaTextArea).length).toEqual(1);
    expect(wrapper.find(TypePart).length).toEqual(1);
    expect(wrapper.find(SequencePart).length).toEqual(1);
  });

  it("renders without sequence part", () => {
    const p = fakeAssertProps();
    p.currentStep.args.assertion_type = "abort";
    const wrapper = shallow(<TileAssertion {...p} />);
    expect(wrapper.find(LuaTextArea).length).toEqual(1);
    expect(wrapper.find(TypePart).length).toEqual(1);
    expect(wrapper.find(SequencePart).length).toEqual(0);
  });

  it("changes editor", () => {
    const wrapper = mount(<TileAssertion {...fakeAssertProps()} />);
    expect(wrapper.find(".fallback-lua-editor").length).toEqual(0);
    wrapper.find(".fa-font").simulate("click");
    expect(wrapper.find(".fallback-lua-editor").length).toEqual(1);
  });
});
