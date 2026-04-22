import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  ColorPicker,
  ColorPickerProps,
  ColorPickerCluster,
  ColorPickerClusterProps,
} from "../color_picker";

describe("<ColorPicker />", () => {
  const fakeProps = (): ColorPickerProps => ({
    current: "green",
    onChange: jest.fn(),
  });

  it("renders saucers", () => {
    const { container } = render(<ColorPicker {...fakeProps()} />);
    expect([1, 9]).toContain(container.querySelectorAll(".saucer").length);
    expect(container.querySelectorAll(".green").length).toBeGreaterThan(0);
  });

  it("renders icon saucers", () => {
    const p = fakeProps();
    p.saucerIcon = "fa-check";
    const { container } = render(<ColorPicker {...p} />);
    expect([1, 9]).toContain(container.querySelectorAll(".icon-saucer").length);
    expect(container.querySelectorAll(".green").length).toBeGreaterThan(0);
  });
});

describe("<ColorPickerCluster />", () => {
  const fakeProps = (): ColorPickerClusterProps => ({
    current: "green",
    onChange: jest.fn(),
  });

  it("renders saucers", () => {
    const { container } = render(<ColorPickerCluster {...fakeProps()} />);
    expect(container.querySelectorAll(".saucer").length).toEqual(8);
  });

  it("renders icon saucers", () => {
    const p = fakeProps();
    p.saucerIcon = "fa-check";
    const { container } = render(<ColorPickerCluster {...p} />);
    expect(container.querySelectorAll("i").length).toEqual(8);
  });

  it("changes color", () => {
    const p = fakeProps();
    const { container } = render(<ColorPickerCluster {...p} />);
    fireEvent.click(container.querySelectorAll("div")[1]);
    expect(p.onChange).toHaveBeenCalledWith("blue");
  });
});
