import React from "react";
import { render } from "@testing-library/react";
import type { FBSelectProps } from "../new_fb_select";

const { FBSelect } = jest.requireActual("../new_fb_select") as
  typeof import("../new_fb_select");

describe("<FBSelect />", () => {
  const fakeProps = (): FBSelectProps => ({
    selectedItem: undefined,
    onChange: jest.fn(),
    list: [{ value: "item", label: "Item" }]
  });

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<FBSelect {...p} />);
    expect(container.textContent).toEqual("None");
  });

  it("renders item", () => {
    const p = fakeProps();
    p.selectedItem = { value: "item", label: "Item" };
    const { container } = render(<FBSelect {...p} />);
    expect(container.textContent).toEqual("Item");
  });

  it("renders custom null label", () => {
    const p = fakeProps();
    p.customNullLabel = "Other";
    const { container } = render(<FBSelect {...p} />);
    expect(container.textContent).toEqual("Other");
  });

  it("allows empty", () => {
    const p = fakeProps();
    p.allowEmpty = true;
    const instance = new FBSelect(p);
    expect(instance.list)
      .toEqual([
        { label: "Item", value: "item" },
        { label: "None", value: "", isNull: true }]);
  });

  it("doesn't allow empty", () => {
    const instance = new FBSelect(fakeProps());
    expect(instance.list)
      .toEqual([{ label: "Item", value: "item" }]);
  });

  it("has extra class", () => {
    const p = fakeProps();
    p.extraClass = "extra";
    const { container } = render(<FBSelect {...p} />);
    expect(container.querySelector("div")?.className).toContain("extra");
  });

  it("has warning class", () => {
    const p = fakeProps();
    p.selectedItem = { value: "item", label: "Item", warn: true };
    const { container } = render(<FBSelect {...p} />);
    expect(container.querySelector("div")?.className).toContain("warning");
  });
});
