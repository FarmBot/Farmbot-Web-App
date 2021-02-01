import React from "react";
import { mount } from "enzyme";
import { TileLua } from "../tile_lua";
import { StepParams } from "../../interfaces";
import { Lua } from "farmbot";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<TileLua />", () => {
  const fakeProps = (): StepParams<Lua> => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "lua", args: { lua: "lua" } },
    dispatch: jest.fn(),
    index: 0,
    resources: buildResourceIndex([]).index,
  });

  it("renders with textarea", () => {
    const wrapper = mount(<TileLua {...fakeProps()} />);
    expect(wrapper.text()).toContain("lua");
    expect(wrapper.html()).toContain("textarea");
  });

  it("changes editor", () => {
    const wrapper = mount(<TileLua {...fakeProps()} />);
    expect(wrapper.find(".fallback-lua-editor").length).toEqual(0);
    wrapper.find(".fa-font").simulate("click");
    expect(wrapper.find(".fallback-lua-editor").length).toEqual(1);
  });
});
