import React from "react";
import { mount } from "enzyme";
import { TileLua } from "../tile_lua";
import { StepParams } from "../../interfaces";
import { Lua } from "farmbot";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import * as screenSize from "../../../screen_size";

let isMobileSpy: jest.SpyInstance;

beforeEach(() => {
  isMobileSpy = jest.spyOn(screenSize, "isMobile").mockReturnValue(false);
});

afterEach(() => {
  isMobileSpy.mockRestore();
});

describe("<TileLua />", () => {
  const fakeProps = (): StepParams<Lua> => ({
    ...fakeStepParams({ kind: "lua", args: { lua: "lua" } }),
  });

  it("renders with textarea", () => {
    const wrapper = mount(<TileLua {...fakeProps()} />);
    expect(wrapper.text()).toContain("lua");
    expect(wrapper.html()).toContain("textarea");
  });

  it("changes editor", () => {
    const wrapper = mount(<TileLua {...fakeProps()} />);
    const before = wrapper.find(".fallback-lua-editor").length;
    const toggle = wrapper.find(".fa-font").length
      ? wrapper.find(".fa-font").first()
      : wrapper.find(".fa-code").first();
    toggle.simulate("click");
    wrapper.update();
    expect(wrapper.find(".fallback-lua-editor").length).not.toEqual(before);
  });

  it("toggles expanded view", () => {
    const wrapper = mount(<TileLua {...fakeProps()} />);
    expect(wrapper.find(".expanded").length).toEqual(0);
    wrapper.find(".fa-expand").simulate("click");
    expect(wrapper.find(".expanded").length).toEqual(1);
  });
});
