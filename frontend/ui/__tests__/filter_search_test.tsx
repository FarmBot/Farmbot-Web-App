import React from "react";
import { mount, shallow } from "enzyme";
import { allMatchedItems, FilterSearch } from "../filter_search";
import { DropDownItem } from "../fb_select";

describe("<FilterSearch />", () => {
  const fakeItem = (extra?: Partial<DropDownItem>): DropDownItem =>
    Object.assign({ label: "label", value: "value" }, extra);

  const fakeProps = () => ({
    items: [],
    selectedItem: fakeItem(),
    onChange: jest.fn(),
    nullChoice: fakeItem(),
  });

  it("selects item", () => {
    const p = fakeProps();
    const wrapper = shallow(<FilterSearch {...p} />);
    const item = fakeItem();
    wrapper.simulate("ItemSelect", item);
    expect(p.onChange).toHaveBeenCalledWith(item);
  });

  it("doesn't select item", () => {
    const p = fakeProps();
    const wrapper = shallow(<FilterSearch {...p} />);
    wrapper.simulate("ItemSelect", undefined);
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("doesn't select header", () => {
    const p = fakeProps();
    const wrapper = shallow(<FilterSearch {...p} />);
    const item = fakeItem({ heading: true });
    wrapper.simulate("ItemSelect", item);
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("handles empty selection", () => {
    const p = fakeProps();
    const wrapper = mount(<FilterSearch {...p} />);
    wrapper.setState({ item: undefined });
    expect(wrapper.text().toLowerCase()).toContain("no selection");
  });

  it("handles empty item", () => {
    const p = fakeProps();
    const wrapper = shallow(<FilterSearch {...p} />);
    const el = (wrapper.props()).itemRenderer({ label: "label" }, {});
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(mount(el).text()).toEqual("label");
    const emptyEl = (wrapper.props()).itemRenderer(undefined, {});
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(mount(emptyEl).text()).toEqual("");
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
