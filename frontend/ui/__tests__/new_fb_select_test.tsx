import React from "react";
import { FBSelect, FBSelectProps } from "../new_fb_select";

const renderedElement = (props: FBSelectProps) =>
  new FBSelect(props).render() as React.ReactElement<{
    className: string;
    children: React.ReactElement<{
      selectedItem: { label: string; value: string };
      nullChoice: { label: string; value: string };
      items: { label: string; value: string }[];
      itemListFilter?: FBSelectProps["itemListFilter"];
    }>;
  }>;

describe("<FBSelect />", () => {
  const fakeProps = (): FBSelectProps => ({
    selectedItem: undefined,
    onChange: jest.fn(),
    list: [{ value: "item", label: "Item" }]
  });

  it("renders", () => {
    const p = fakeProps();
    const element = renderedElement(p);
    expect(element.props.children.props.selectedItem.label).toEqual("None");
    expect(element.props.children.props.nullChoice.label).toEqual("None");
  });

  it("renders item", () => {
    const p = fakeProps();
    p.selectedItem = { value: "item", label: "Item" };
    const element = renderedElement(p);
    expect(element.props.children.props.selectedItem.label).toEqual("Item");
  });

  it("renders custom null label", () => {
    const p = fakeProps();
    p.customNullLabel = "Other";
    const element = renderedElement(p);
    expect(element.props.children.props.selectedItem.label).toEqual("Other");
    expect(element.props.children.props.nullChoice.label).toEqual("Other");
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
    const element = renderedElement(p);
    expect(element.props.className).toContain("extra");
  });

  it("has warning class", () => {
    const p = fakeProps();
    p.selectedItem = { value: "item", label: "Item", warn: true };
    const element = renderedElement(p);
    expect(element.props.className).toContain("warning");
  });

  it("passes the query list filter", () => {
    const p = fakeProps();
    p.itemListFilter = jest.fn();
    const element = renderedElement(p);
    expect(element.props.children.props.itemListFilter)
      .toEqual(p.itemListFilter);
  });

  it("only updates when props change", () => {
    const p = fakeProps();
    const instance = new FBSelect(p);

    expect(instance.shouldComponentUpdate(p)).toBeFalsy();
    expect(instance.shouldComponentUpdate({ ...p, itemListFilter: jest.fn() }))
      .toBeTruthy();
  });
});
