import React from "react";
import { render } from "@testing-library/react";
import { LuaTextArea, LuaTextAreaProps } from "../tile_lua_support";
import { Lua } from "farmbot";
import { Editor as _Editor } from "@monaco-editor/react";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import { StateToggleKey } from "../../step_ui";
import { Path } from "../../../internal_urls";

describe("<LuaTextArea />", () => {
  const fakeProps = (): LuaTextAreaProps<Lua> => ({
    ...fakeStepParams({ kind: "lua", args: { lua: "lua" } }),
    stateToggles: {},
  });

  const fakeComponent = (p = fakeProps()) => {
    const component = new LuaTextArea<Lua>(p);
    component.setState =
      (state: Partial<typeof component.state>) =>
        Object.assign(component.state, state) as never;
    return component;
  };

  it("changes lua", () => {
    const p = fakeProps();
    p.stateToggles[StateToggleKey.monacoEditor] =
      { enabled: true, toggle: jest.fn() };
    const component = fakeComponent(p);
    const updateStep = Object.assign(jest.fn(), { cancel: jest.fn(), flush: jest.fn() });
    component.updateStep = updateStep;
    expect(component.state.lua).toEqual("lua");
    component.onChange("123");
    expect(updateStep).toHaveBeenCalledWith("123");
    expect(component.state.lua).toEqual("123");
  });

  it("handles undefined value", () => {
    const p = fakeProps();
    p.stateToggles[StateToggleKey.monacoEditor] =
      { enabled: true, toggle: jest.fn() };
    const component = fakeComponent(p);
    const updateStep = Object.assign(jest.fn(), { cancel: jest.fn(), flush: jest.fn() });
    component.updateStep = updateStep;
    component.onChange(undefined as unknown as string);
    expect(updateStep).toHaveBeenCalledWith("");
    expect(component.state.lua).toEqual("");
  });

  it("makes change in fallback editor", () => {
    const p = fakeProps();
    const component = fakeComponent(p);
    const updateStep = Object.assign(
      jest.fn(),
      { cancel: jest.fn(), flush: jest.fn() });
    component.updateStep = updateStep;
    const fallback = component.FallbackEditor({}) as React.ReactElement<{
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
      onBlur: () => void;
    }>;
    fallback.props.onChange({
      currentTarget: { value: "123" }
    } as React.ChangeEvent<HTMLTextAreaElement>);
    expect(component.state.lua).toEqual("123");
    fallback.props.onBlur();
    expect(updateStep).toHaveBeenCalledWith("123");
  });

  it("doesn't make changes when read-only", () => {
    const p = fakeProps();
    p.readOnly = true;
    const component = fakeComponent(p);
    const updateStep = Object.assign(
      jest.fn(),
      { cancel: jest.fn(), flush: jest.fn() });
    component.updateStep = updateStep;
    const fallback = component.FallbackEditor({}) as React.ReactElement<{
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
      onBlur: () => void;
    }>;
    fallback.props.onChange({
      currentTarget: { value: "123" }
    } as React.ChangeEvent<HTMLTextAreaElement>);
    expect(component.state.lua).toEqual("lua");
    fallback.props.onBlur();
    expect(updateStep).toHaveBeenCalledWith("lua");
  });

  it("renders for designer", () => {
    location.pathname = Path.mock(Path.designer());
    const { container } = render(<LuaTextArea {...fakeProps()} />);
    expect(container.querySelector(".lua-editor.full")).toBeNull();
  });

  it("renders full editor", () => {
    location.pathname = Path.mock(Path.sequencePage());
    const { container } = render(<LuaTextArea {...fakeProps()} />);
    expect(container.querySelector(".lua-editor.full")).not.toBeNull();
  });

  it("renders as loading", () => {
    const fallback = fakeComponent().FallbackEditor({ loading: true }) as
      React.ReactElement<{ className: string }>;
    expect(fallback.props.className).toEqual("");
  });

  it("renders expanded", () => {
    location.pathname = Path.mock(Path.sequencePage());
    const p = fakeProps();
    p.stateToggles[StateToggleKey.luaExpanded] =
      { enabled: true, toggle: jest.fn() };
    const { container } = render(<LuaTextArea {...p} />);
    expect(container.querySelector(".lua-editor.expanded")).not.toBeNull();
  });
});
