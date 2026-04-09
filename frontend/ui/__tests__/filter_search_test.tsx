import React from "react";
import { allMatchedItems, FilterSearch } from "../filter_search";
import { DropDownItem } from "../fb_select";
import { ItemRendererProps } from "@blueprintjs/select";
import {
  actRenderer,
  createRenderer,
  getRendererInstance,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

describe("<FilterSearch />", () => {
  const wrappers: ReturnType<typeof createRenderer>[] = [];

  const fakeItem = (extra?: Partial<DropDownItem>): DropDownItem =>
    Object.assign({ label: "label", value: "value" }, extra);

  const fakeProps = () => ({
    items: [],
    selectedItem: fakeItem(),
    onChange: jest.fn(),
    nullChoice: fakeItem(),
  });

  const createWrapper = (p = fakeProps()) => {
    const wrapper = createRenderer(<FilterSearch {...p} />);
    wrappers.push(wrapper);
    return wrapper;
  };

  const getInstance = (wrapper: ReturnType<typeof createRenderer>) =>
    getRendererInstance<FilterSearch, React.ComponentProps<typeof FilterSearch>>(
      wrapper, FilterSearch);

  afterEach(() => {
    while (wrappers.length > 0) {
      const wrapper = wrappers.pop();
      wrapper && unmountRenderer(wrapper);
    }
  });

  it("selects item", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const item = fakeItem();
    actRenderer(() => {
      getInstance(wrapper)["handleValueChange"](item as never);
    });
    expect(p.onChange).toHaveBeenCalledWith(item);
  });

  it("doesn't select item", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    actRenderer(() => {
      getInstance(wrapper)["handleValueChange"](undefined as never);
    });
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("doesn't select header", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const item = fakeItem({ heading: true });
    actRenderer(() => {
      getInstance(wrapper)["handleValueChange"](item as never);
    });
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("handles empty selection", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    actRenderer(() => {
      getInstance(wrapper).setState({
        item: undefined,
      });
    });
    expect(JSON.stringify(wrapper.toJSON()).toLowerCase())
      .toContain("no selection");
  });

  it("handles empty item", () => {
    const wrapper = createWrapper();
    const renderItem = getInstance(wrapper)["default"];
    const item = { label: "label", value: "" };
    const renderProps = {
      handleClick: jest.fn(),
      index: 0,
      modifiers: { active: false, disabled: false, matchesPredicate: true },
      query: "",
      ref: jest.fn(),
    } as ItemRendererProps<HTMLLIElement>;
    const el = renderItem?.(item, renderProps);
    expect(el?.props.text).toEqual("label");
    const emptyEl = renderItem?.(undefined, renderProps);
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
