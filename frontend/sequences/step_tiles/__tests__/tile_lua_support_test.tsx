const lodash = require("lodash");
lodash.debounce = jest.fn(x => x);

const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({ editStep: mockEditStep }));

import React from "react";
import { shallow } from "enzyme";
import { LuaTextArea, LuaTextAreaProps } from "../tile_lua_support";
import { Lua } from "farmbot";
import { Editor } from "@monaco-editor/react";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import { StateToggleKey } from "../../step_ui";
import { Path } from "../../../internal_urls";

describe("<LuaTextArea />", () => {
  const fakeProps = (): LuaTextAreaProps<Lua> => ({
    ...fakeStepParams({ kind: "lua", args: { lua: "lua" } }),
    stateToggles: {},
  });

  it("changes lua", () => {
    const p = fakeProps();
    p.stateToggles[StateToggleKey.monacoEditor] =
      { enabled: true, toggle: jest.fn() };
    const wrapper = shallow<LuaTextArea<Lua>>(<LuaTextArea {...p} />);
    expect(wrapper.state().lua).toEqual("lua");
    wrapper.find(Editor).simulate("change", "123");
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({ kind: "lua", args: { lua: "123" } });
    expect(wrapper.state().lua).toEqual("123");
  });

  it("handles undefined value", () => {
    const p = fakeProps();
    p.stateToggles[StateToggleKey.monacoEditor] =
      { enabled: true, toggle: jest.fn() };
    const wrapper = shallow(<LuaTextArea {...p} />);
    wrapper.find(Editor).simulate("change", undefined);
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({ kind: "lua", args: { lua: "" } });
  });

  it("makes change in fallback editor", () => {
    const p = fakeProps();
    const wrapper = shallow<LuaTextArea<Lua>>(<LuaTextArea {...p} />);
    const fallback = shallow(wrapper.instance().FallbackEditor({}));
    fallback.find("textarea").simulate("change", {
      currentTarget: { value: "123" }
    });
    fallback.find("textarea").simulate("blur");
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({ kind: "lua", args: { lua: "123" } });
  });

  it("doesn't make changes when read-only", () => {
    const p = fakeProps();
    p.readOnly = true;
    const wrapper = shallow<LuaTextArea<Lua>>(<LuaTextArea {...p} />);
    const fallback = shallow(wrapper.instance().FallbackEditor({}));
    fallback.find("textarea").simulate("change", {
      currentTarget: { value: "123" }
    });
    fallback.find("textarea").simulate("blur");
    expect(mockEditStep).not.toHaveBeenCalled();
  });

  it("renders for designer", () => {
    location.pathname = Path.mock(Path.designer());
    const wrapper = shallow(<LuaTextArea {...fakeProps()} />);
    expect(wrapper.find(".lua-editor").hasClass("full")).toBeFalsy();
  });

  it("renders full editor", () => {
    location.pathname = Path.mock(Path.sequencePage());
    const wrapper = shallow(<LuaTextArea {...fakeProps()} />);
    expect(wrapper.find(".lua-editor").hasClass("full")).toBeTruthy();
  });

  it("renders as loading", () => {
    const p = fakeProps();
    const wrapper = shallow<LuaTextArea<Lua>>(<LuaTextArea {...p} />);
    const fallback = shallow(wrapper.instance().FallbackEditor({ loading: true }));
    expect(fallback.hasClass("fallback-lua-editor")).toBeFalsy();
  });

  it("renders expanded", () => {
    location.pathname = Path.mock(Path.sequencePage());
    const p = fakeProps();
    p.stateToggles[StateToggleKey.luaExpanded] =
      { enabled: true, toggle: jest.fn() };
    const wrapper = shallow(<LuaTextArea {...p} />);
    expect(wrapper.find(".lua-editor").hasClass("expanded")).toBeTruthy();
  });
});
