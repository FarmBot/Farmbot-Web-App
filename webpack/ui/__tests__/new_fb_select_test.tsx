import * as React from "react";
import { mount, shallow } from "enzyme";
import { FBSelect, FBSelectProps } from "../new_fb_select";

describe("<FBSelect />", () => {
  const fakeProps = (): FBSelectProps => {
    return {
      selectedItem: undefined,
      onChange: jest.fn(),
      list: [{ value: "item", label: "Item" }]
    };
  };

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<FBSelect {...p} />);
    expect(wrapper.text()).toEqual("None");
  });

  it("renders item", () => {
    const p = fakeProps();
    p.selectedItem = { value: "item", label: "Item" };
    const wrapper = mount(<FBSelect {...p} />);
    expect(wrapper.text()).toEqual("Item");
  });

  it("renders custom null label", () => {
    const p = fakeProps();
    p.customNullLabel = "Other";
    const wrapper = mount(<FBSelect {...p} />);
    expect(wrapper.text()).toEqual("Other");
  });

  it("allows empty", () => {
    const p = fakeProps();
    p.allowEmpty = true;
    const wrapper = shallow(<FBSelect {...p} />);
    // tslint:disable-next-line:no-any
    expect((wrapper.find("FilterSearch").props() as any).items)
      .toEqual([
        { label: "Item", value: "item" },
        { label: "None", value: "" }]);
  });

  it("doesn't allow empty", () => {
    const wrapper = shallow(<FBSelect {...fakeProps()} />);
    // tslint:disable-next-line:no-any
    expect((wrapper.find("FilterSearch").props() as any).items)
      .toEqual([{ label: "Item", value: "item" }]);
  });

  it("has extra class", () => {
    const p = fakeProps();
    p.extraClass = "extra";
    const wrapper = mount(<FBSelect {...p} />);
    expect(wrapper.find("div").first().hasClass("extra")).toBeTruthy();
  });
});
