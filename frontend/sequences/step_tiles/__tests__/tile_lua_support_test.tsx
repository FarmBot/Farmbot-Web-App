const lodash = require("lodash");
lodash.debounce = jest.fn(x => x);

const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({ editStep: mockEditStep }));

import React from "react";
import { shallow } from "enzyme";
import { LuaTextArea } from "../tile_lua_support";
import { StepParams } from "../../interfaces";
import { Lua } from "farmbot";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import Editor from "@monaco-editor/react";

describe("<LuaTextArea />", () => {
  const fakeProps = (): StepParams<Lua> => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "lua", args: { lua: "lua" } },
    dispatch: jest.fn(),
    index: 0,
    resources: buildResourceIndex([]).index,
  });

  it("changes lua", () => {
    const p = fakeProps();
    const wrapper = shallow<LuaTextArea<Lua>>(<LuaTextArea {...p} />);
    expect(wrapper.state().lua).toEqual("lua");
    wrapper.find(Editor).simulate("change", "123");
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({ kind: "lua", args: { lua: "123" } });
    expect(wrapper.state().lua).toEqual("123");
  });

  it("handles undefined value", () => {
    const p = fakeProps();
    const wrapper = shallow(<LuaTextArea {...p} />);
    wrapper.find(Editor).simulate("change", undefined);
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({ kind: "lua", args: { lua: "" } });
  });

  it("makes change in fallback editor", () => {
    const p = fakeProps();
    const wrapper = shallow<LuaTextArea<Lua>>(<LuaTextArea {...p} />);
    const fallback = shallow(wrapper.instance().FallbackEditor());
    fallback.find("textarea").simulate("change", {
      currentTarget: { value: "123" }
    });
    fallback.find("textarea").simulate("blur");
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({ kind: "lua", args: { lua: "123" } });
  });
});
