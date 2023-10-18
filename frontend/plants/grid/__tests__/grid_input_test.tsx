import React from "react";
import { GridInput, InputCell } from "../grid_input";
import { mount, shallow } from "enzyme";
import { GridInputProps, InputCellProps, PlantGridData } from "../interfaces";

const testGridInputs = (): PlantGridData => ({
  startX: 11,
  startY: 31,
  spacingH: 5,
  spacingV: 7,
  numPlantsH: 2,
  numPlantsV: 3
});

describe("<GridInput/>", () => {
  const fakeProps = (): GridInputProps => ({
    itemType: "plants",
    disabled: false,
    grid: testGridInputs(),
    xy_swap: true,
    onChange: jest.fn(() => jest.fn()),
    preview: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    onUseCurrentPosition: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<GridInput {...fakeProps()} />);
    ["XYStart", "# of plants", "Spacing (MM)"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("renders for points", () => {
    const p = fakeProps();
    p.itemType = "points";
    const wrapper = mount(<GridInput {...p} />);
    expect(wrapper.text()).toContain("# of points");
  });

  it("uses current location", () => {
    const p = fakeProps();
    p.botPosition = { x: 1, y: 2, z: 3 };
    const wrapper = mount(<GridInput {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(p.onUseCurrentPosition).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });

  it("doesn't use current location", () => {
    const p = fakeProps();
    const wrapper = mount(<GridInput {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(p.onChange).not.toHaveBeenCalled();
  });
});

describe("<InputCell/>", () => {
  const fakeProps = (): InputCellProps => ({
    itemType: "plants",
    gridKey: "numPlantsH",
    xy_swap: false,
    onChange: jest.fn(),
    preview: jest.fn(),
    grid: testGridInputs(),
  });

  it("calls onChange", () => {
    const p = fakeProps();
    const wrapper = shallow(<InputCell {...p} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "6" }
    });
    expect(p.onChange).not.toHaveBeenCalled();
    expect(wrapper.find("input").props().value).toEqual("6");
  });

  it("calls onChange with no value", () => {
    const p = fakeProps();
    const wrapper = shallow(<InputCell {...p} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "" }
    });
    expect(p.onChange).not.toHaveBeenCalled();
    expect(wrapper.find("input").props().value).toEqual("");
  });

  it("calls onBlur", () => {
    const p = fakeProps();
    const wrapper = shallow(<InputCell {...p} />);
    wrapper.find("input").first().simulate("blur");
    expect(p.onChange).toHaveBeenCalledWith(p.gridKey, 2);
    expect(p.preview).toHaveBeenCalled();
    expect(wrapper.find("input").props().value).toEqual("2");
  });

  it("calls onBlur with no value", () => {
    const p = fakeProps();
    const wrapper = shallow(<InputCell {...p} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "" }
    });
    expect(wrapper.find("input").props().value).toEqual("");
    wrapper.find("input").first().simulate("blur");
    expect(p.preview).not.toHaveBeenCalled();
    expect(wrapper.find("input").props().value).toEqual("2");
  });
});
