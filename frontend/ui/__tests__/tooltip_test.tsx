import React from "react";
import TestRenderer from "react-test-renderer";
import { fireEvent, render, RenderResult } from "@testing-library/react";
import { ToolTip, ToolTipProps } from "../tooltip";

describe("<ToolTip />", () => {
  const fakeProps = (): ToolTipProps => ({
    helpText: "such help",
    docPage: "weed-detection",
    dispatch: jest.fn(),
  });

  let wrapper: RenderResult;

  beforeEach(() => {
    wrapper = render(<ToolTip {...fakeProps()} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it("renders correct text", () => {
    expect(wrapper.container.querySelector(".title-help-text")?.innerHTML)
      .toContain("such help");
  });

  it("has a closed initial state", () => {
    expect(wrapper.container.querySelector(".title-help-text")
      ?.classList.contains("open")).toBeFalsy();
  });

  it("doesn't show text when closed", () => {
    expect(wrapper.container.querySelectorAll(".title-help-text").length)
      .toEqual(1);
    expect(wrapper.container.querySelectorAll(".title-help-text.open").length)
      .toEqual(0);
  });

  it("toggles open state", () => {
    fireEvent.click(
      wrapper.container.querySelector(".fa-question-circle") as Element);
    expect(wrapper.container.querySelector(".title-help-text")
      ?.classList.contains("open")).toBeTruthy();
  });

  it("renders doc link", () => {
    expect(wrapper.container.textContent).toContain("Documentation");
    expect(wrapper.container.querySelector(".fa-external-link")).toBeTruthy();
    fireEvent.click(wrapper.container.querySelector("a") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("weed-detection"));
  });

  it("stops propagation", () => {
    const e = { stopPropagation: jest.fn() };
    const testWrapper = TestRenderer.create(<ToolTip {...fakeProps()} />);
    testWrapper.root.findByProps({ className: "title-help" }).props.onClick(e);
    expect(e.stopPropagation).toHaveBeenCalled();
    testWrapper.unmount();
  });
});
