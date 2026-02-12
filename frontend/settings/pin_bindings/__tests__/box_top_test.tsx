import React from "react";
import { render } from "@testing-library/react";
import { BoxTop } from "../box_top";
import { BoxTopProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { bot } from "../../../__test_support__/fake_state/bot";

jest.mock("../model", () => ({
  ElectronicsBoxModel: () => <div className={"electronics-box-3d-model"} />,
}));

jest.mock("../box_top_gpio_diagram", () => ({
  BoxTopButtons: () => <div className={"box-top-2d-wrapper"} />,
}));

describe("<BoxTop />", () => {
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
