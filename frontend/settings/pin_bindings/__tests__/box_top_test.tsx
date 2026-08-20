import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { BoxTop } from "../box_top";
import { BoxTopProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { bot } from "../../../__test_support__/fake_state/bot";
import * as model from "../model";
import * as boxTopGpioDiagram from "../box_top_gpio_diagram";
import * as configActions from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";

let electronicsBoxModelSpy: jest.SpyInstance;
let boxTopButtonsSpy: jest.SpyInstance;

describe("<BoxTop />", () => {
  beforeEach(() => {
    electronicsBoxModelSpy = jest.spyOn(model, "ElectronicsBoxModel")
      .mockImplementation(() => <div className={"electronics-box-3d-model"} />);
    boxTopButtonsSpy = jest.spyOn(boxTopGpioDiagram, "BoxTopButtons")
      .mockImplementation(((_: BoxTopProps) =>
        <div className={"box-top-2d-wrapper"} />) as never);
  });

  afterEach(() => {
    electronicsBoxModelSpy.mockRestore();
    boxTopButtonsSpy.mockRestore();
  });

  const fakeProps = (): BoxTopProps => ({
    threeDimensions: false,
    firmwareHardware: "arduino",
    isEditing: true,
    dispatch: jest.fn(),
    resources: buildResourceIndex().index,
    botOnline: true,
    bot,
  });

  it("renders 2D box", () => {
    const p = fakeProps();
    p.threeDimensions = false;
    const { container } = render(<BoxTop {...p} />);
    expect(container.querySelectorAll(".box-top-2d-wrapper").length).toEqual(1);
    expect(container.querySelectorAll(".electronics-box-3d-model").length)
      .toEqual(0);
  });

  it("renders 3D box", () => {
    const p = fakeProps();
    p.threeDimensions = true;
    const { container } = render(<BoxTop {...p} />);
    expect(container.querySelectorAll(".box-top-2d-wrapper").length).toEqual(0);
    expect(container.querySelectorAll(".electronics-box-3d-model").length)
      .toEqual(1);
  });

  it("falls back when WebGL is unavailable", () => {
    const webGLSpy = jest.spyOn(HTMLCanvasElement.prototype, "getContext")
      // eslint-disable-next-line no-null/no-null
      .mockImplementation((() => null) as never);
    const setConfig = jest.spyOn(configActions, "setWebAppConfigValue");
    const p = fakeProps();
    p.threeDimensions = true;
    const { container } = render(<BoxTop {...p} />);
    expect(container.textContent).toContain("3D graphics unavailable");
    expect(electronicsBoxModelSpy).not.toHaveBeenCalled();
    const toggle = container.querySelector(".fb-toggle-button");
    toggle && fireEvent.click(toggle);
    expect(setConfig).toHaveBeenCalledWith(
      BooleanSetting.enable_3d_electronics_box_top, false);
    webGLSpy.mockRestore();
    setConfig.mockRestore();
  });
});
