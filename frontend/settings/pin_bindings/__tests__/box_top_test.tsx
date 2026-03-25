import React from "react";
import { render } from "@testing-library/react";
import { BoxTop } from "../box_top";
import { BoxTopProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { bot } from "../../../__test_support__/fake_state/bot";
import * as model from "../model";
import * as boxTopGpioDiagram from "../box_top_gpio_diagram";

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
});
