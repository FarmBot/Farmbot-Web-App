import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  effectiveSectionCenter, manualSectionCenter, normalizeSectionValue,
  sectionCenterMax, sectionWidthMax, SectionValueControl,
  ThreeDSectionSettings,
} from "../three_d_section";
import { fakeDesignerState } from
  "../../__test_support__/fake_designer_state";
import { Actions } from "../../constants";

describe("3D section helpers", () => {
  it("normalizes section values", () => {
    expect(normalizeSectionValue(49, 50, 1000)).toEqual(50);
    expect(normalizeSectionValue(149.6, 50, 1000)).toEqual(150);
    expect(normalizeSectionValue(-1, 0, 1200)).toEqual(0);
    expect(normalizeSectionValue(2000, 0, 1200)).toEqual(1200);
    expect(sectionCenterMax(1230.9)).toEqual(1230);
    expect(sectionWidthMax(1230.9)).toEqual(2461);
    expect(sectionWidthMax(0)).toEqual(1);
  });

  it("uses stored, midpoint, and followed centers", () => {
    const designer = fakeDesignerState();
    designer.threeDSectionAxis = "x";
    const size = { x: 3000, y: 1200 };
    expect(manualSectionCenter(designer, size)).toEqual(1500);
    designer.threeDSectionCenter.x = 700;
    expect(manualSectionCenter(designer, size)).toEqual(700);
    designer.threeDSectionFollowBot = true;
    expect(effectiveSectionCenter(designer, size, { x: 321, y: 0, z: 0 }))
      .toEqual(321);
    expect(effectiveSectionCenter(designer, size, undefined)).toEqual(700);
    expect(effectiveSectionCenter(
      designer, size, { x: 4000, y: 0, z: 0 }))
      .toEqual(3000);
  });
});

describe("<SectionValueControl />", () => {
  it("uses carets and slider", () => {
    const onChange = jest.fn();
    const { container } = render(<SectionValueControl
      label={"WIDTH"}
      value={500}
      min={50}
      max={1000}
      onChange={onChange} />);
    fireEvent.click(screen.getByTitle("increase WIDTH"));
    fireEvent.click(screen.getByTitle("decrease WIDTH"));
    fireEvent.change(container.querySelector("input[type='range']") as Element, {
      target: { value: "849" },
    });
    const numberInput = container.querySelector("input[type='number']") as Element;
    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, { target: { value: "951" } });
    fireEvent.blur(numberInput);
    expect(onChange).toHaveBeenNthCalledWith(1, 501);
    expect(onChange).toHaveBeenNthCalledWith(2, 499);
    expect(onChange).toHaveBeenNthCalledWith(3, 849);
    expect(onChange).toHaveBeenNthCalledWith(4, 951);
  });

  it("disables all controls", () => {
    const { container } = render(<SectionValueControl
      label={"CENTER"}
      value={500}
      min={0}
      max={1000}
      disabled={true}
      onChange={jest.fn()} />);
    expect(container.querySelectorAll(":disabled")).toHaveLength(4);
    expect(container.querySelector(".three-d-section-value"))
      .toHaveClass("disabled", "info-box");
  });
});

describe("<ThreeDSectionSettings />", () => {
  it("renders controls and updates section settings", () => {
    const designer = fakeDesignerState();
    designer.threeDSectionOpen = true;
    designer.threeDSectionFollowBot = false;
    const dispatch = jest.fn();
    const { container } = render(<ThreeDSectionSettings
      designer={designer}
      dispatch={dispatch}
      gardenSize={{ x: 3000, y: 1200 }} />);
    expect(container.textContent).toContain("AXIS");
    expect(container.textContent).toContain("FOLLOW BOT");
    expect(container.textContent).toContain("CUT ALL");
    expect(container.firstChild).toHaveClass("three-d-section-settings");
    expect(container.querySelector(".three-d-section-toggles"))
      .toHaveClass("grid");
    expect(container.querySelector(".three-d-section-view"))
      .toHaveClass("grid-exp-1");
    expect(container.querySelector(".three-d-section-follow"))
      .toHaveClass("grid-exp-1");
    expect(container.querySelectorAll(".three-d-section-value.info-box"))
      .toHaveLength(2);
    expect(container.querySelector("input[type='range']"))
      .toHaveAttribute("min", "1");
    expect(screen.getByLabelText("WIDTH slider"))
      .toHaveAttribute("max", "6000");
    fireEvent.click(screen.getByTitle("AXIS"));
    fireEvent.click(screen.getByTitle("increase WIDTH"));
    fireEvent.click(screen.getByTitle("decrease CENTER"));
    fireEvent.click(screen.getByTitle("FOLLOW BOT"));
    fireEvent.click(screen.getByTitle("CUT ALL"));
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_AXIS,
      payload: "y",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_WIDTH,
      payload: 201,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_CENTER,
      payload: { x: 1499, y: undefined },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_FOLLOW_BOT,
      payload: true,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_CUT_ALL,
      payload: false,
    });
  });

  it("uses twice the chosen axis length as the maximum width", () => {
    const designer = fakeDesignerState();
    designer.threeDSectionAxis = "x";
    designer.threeDSectionWidth = 5000;
    const dispatch = jest.fn();
    const settings = <ThreeDSectionSettings
      designer={designer}
      dispatch={dispatch}
      gardenSize={{ x: 3000, y: 1200 }} />;
    const { rerender } = render(settings);
    expect(screen.getByLabelText("WIDTH slider"))
      .toHaveAttribute("max", "6000");
    fireEvent.click(screen.getByTitle("AXIS"));
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: Actions.SET_3D_SECTION_AXIS,
      payload: "y",
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: Actions.SET_3D_SECTION_WIDTH,
      payload: 2400,
    });

    designer.threeDSectionAxis = "y";
    rerender(<ThreeDSectionSettings
      designer={designer}
      dispatch={jest.fn()}
      gardenSize={{ x: 3000, y: 1200 }} />);
    expect(screen.getByLabelText("WIDTH slider"))
      .toHaveAttribute("max", "2400");
  });
});
