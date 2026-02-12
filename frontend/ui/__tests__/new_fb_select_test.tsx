import React from "react";
import type { FBSelectProps } from "../new_fb_select";

const getFBSelect = async () =>
  (await import(`../new_fb_select.tsx?m=${Math.random()}`)).FBSelect;

const renderedElement = async (props: FBSelectProps) => {
  const FBSelect = await getFBSelect();
  return new FBSelect(props).render() as React.ReactElement<{
    className: string;
    children: React.ReactElement<{
      selectedItem: { label: string; value: string };
      nullChoice: { label: string; value: string };
      items: { label: string; value: string }[];
    }>;
  }>;
};

describe("<FBSelect />", () => {
  const fakeProps = (): FBSelectProps => ({
    selectedItem: undefined,
    onChange: jest.fn(),
    list: [{ value: "item", label: "Item" }]
  });

  it("renders", async () => {
    const p = fakeProps();
    const element = await renderedElement(p);
    expect(element.props.children.props.selectedItem.label).toEqual("None");
    expect(element.props.children.props.nullChoice.label).toEqual("None");
  });

  it("renders item", async () => {
    const p = fakeProps();
    p.selectedItem = { value: "item", label: "Item" };
    const element = await renderedElement(p);
    expect(element.props.children.props.selectedItem.label).toEqual("Item");
  });

  it("renders custom null label", async () => {
    const p = fakeProps();
    p.customNullLabel = "Other";
    const element = await renderedElement(p);
    expect(element.props.children.props.selectedItem.label).toEqual("Other");
    expect(element.props.children.props.nullChoice.label).toEqual("Other");
  });

  it("allows empty", async () => {
    const FBSelect = await getFBSelect();
    const p = fakeProps();
    p.allowEmpty = true;
    const instance = new FBSelect(p);
    expect(instance.list)
      .toEqual([
        { label: "Item", value: "item" },
        { label: "None", value: "", isNull: true }]);
  });

  it("doesn't allow empty", async () => {
    const FBSelect = await getFBSelect();
    const instance = new FBSelect(fakeProps());
    expect(instance.list)
      .toEqual([{ label: "Item", value: "item" }]);
  });

  it("has extra class", async () => {
    const p = fakeProps();
    p.extraClass = "extra";
    const element = await renderedElement(p);
    expect(element.props.className).toContain("extra");
  });

  it("has warning class", async () => {
    const p = fakeProps();
    p.selectedItem = { value: "item", label: "Item", warn: true };
    const element = await renderedElement(p);
    expect(element.props.className).toContain("warning");
  });
});
