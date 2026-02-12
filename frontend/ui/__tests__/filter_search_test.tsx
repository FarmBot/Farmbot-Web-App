import React from "react";
import TestRenderer from "react-test-renderer";
import { allMatchedItems, FilterSearch } from "../filter_search";
import { DropDownItem } from "../fb_select";

describe("<FilterSearch />", () => {
  const wrappers: TestRenderer.ReactTestRenderer[] = [];

  const fakeItem = (extra?: Partial<DropDownItem>): DropDownItem =>
    Object.assign({ label: "label", value: "value" }, extra);

  const fakeProps = () => ({
    items: [],
    selectedItem: fakeItem(),
    onChange: jest.fn(),
    nullChoice: fakeItem(),
  });

  const createWrapper = (p = fakeProps()) => {
    const wrapper = TestRenderer.create(<FilterSearch {...p} />);
    wrappers.push(wrapper);
    return wrapper;
  };

  afterEach(() => {
    while (wrappers.length > 0) {
      const wrapper = wrappers.pop();
      wrapper && TestRenderer.act(() => wrapper.unmount());
    }
  });

  it("selects item", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const item = fakeItem();
    (wrapper.getInstance() as FilterSearch | null)
      ?.['handleValueChange'](item as never);
    expect(p.onChange).toHaveBeenCalledWith(item);
  });

  it("doesn't select item", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    (wrapper.getInstance() as FilterSearch | null)
      ?.['handleValueChange'](undefined as never);
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("doesn't select header", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const item = fakeItem({ heading: true });
    (wrapper.getInstance() as FilterSearch | null)
      ?.['handleValueChange'](item as never);
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("handles empty selection", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    (wrapper.getInstance() as FilterSearch | null)?.setState({
      item: undefined,
    });
    expect(JSON.stringify(wrapper.toJSON()).toLowerCase())
      .toContain("no selection");
  });

  it("handles empty item", () => {
    const wrapper = createWrapper();
    const renderItem = (wrapper.getInstance() as FilterSearch | null)
      ?.['default'];
    const el = renderItem?.({ label: "label" }, {
      handleClick: jest.fn(),
      index: 0,
    });
    expect(el?.props.text).toEqual("label");
    const emptyEl = renderItem?.(undefined, {
      handleClick: jest.fn(),
      index: 0,
    });
    expect(emptyEl?.props.text).toEqual("");
  });
});

describe("allMatchedItems()", () => {
  it("matches singulars with plural query", () => {
    expect(allMatchedItems([
      { label: "--- Plants", value: "", headingId: "Plant", heading: true },
      { label: "plant", value: "", headingId: "Plant" },
      { label: "mint", value: "", headingId: "Plant" },
      { label: "--- Tools", value: "", headingId: "Tool", heading: true },
      { label: "tool", value: "", headingId: "Tool" },
      { label: "for plants", value: "", headingId: "Tool" },
    ], "plants")).toEqual([
      { label: "plant", value: "", headingId: "Plant" },
      { label: "mint", value: "", headingId: "Plant" },
      { label: "for plants", value: "", headingId: "Tool" },
    ]);
  });

  it("handles missing headingId and uppercase", () => {
    expect(allMatchedItems([
      { label: "Easy", value: "" },
      { label: "easy", value: "" },
    ], "Easy")).toEqual([
      { label: "Easy", value: "" },
      { label: "easy", value: "" },
    ]);
  });
});
