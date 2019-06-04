import * as React from "react";
import { shallow } from "enzyme";
import { FilterSearch } from "../filter_search";
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

  it("doesn't select header", () => {
    const p = fakeProps();
    const wrapper = shallow(<FilterSearch {...p} />);
    const item = fakeItem({ heading: true });
    wrapper.simulate("ItemSelect", item);
    expect(p.onChange).not.toHaveBeenCalled();
  });
});
