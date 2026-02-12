import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { BotConfigInputBox, BotConfigInputBoxProps } from "../bot_config_input_box";
import * as deviceActions from "../../../devices/actions";

let updateConfigSpy: jest.SpyInstance;

beforeEach(() => {
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn() as never);
});

afterEach(() => {
  updateConfigSpy.mockRestore();
});

describe("<BotConfigInputBox />", () => {
  const commit = (container: HTMLElement, value: string) => {
    const input = container.querySelector("input");
    if (!input) { throw new Error("Expected config input"); }
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
  };

  const fakeProps = (): BotConfigInputBoxProps => ({
    setting: "safe_height",
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: 1, consistent: true })
  });

  it("renders value: number", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: true });
    const { container } = render(<BotConfigInputBox {...p} />);
    const input = container.querySelector("input");
    expect(input?.value).toEqual("10");
    expect(input?.className).toEqual("");
  });

  it("doesn't render value: string", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: "bad", consistent: true });
    const { container } = render(<BotConfigInputBox {...p} />);
    const input = container.querySelector("input");
    expect(input?.value).toEqual("");
  });

  it("updates value", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 0, consistent: true });
    const { container } = render(<BotConfigInputBox {...p} />);
    commit(container, "10");
    expect(updateConfigSpy).toHaveBeenCalledWith({ safe_height: 10 });
    expect(p.dispatch).toHaveBeenCalledWith(updateConfigSpy.mock.results[0].value);
  });

  it("doesn't update value: same value", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: true });
    const { container } = render(<BotConfigInputBox {...p} />);
    commit(container, "10");
    expect(updateConfigSpy).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("doesn't update value: NaN", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: true });
    const { container } = render(<BotConfigInputBox {...p} />);
    commit(container, "x");
    expect(updateConfigSpy).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("not consistent", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: false });
    const { container } = render(<BotConfigInputBox {...p} />);
    const input = container.querySelector("input");
    expect(input?.className).toEqual("dim");
  });
});
