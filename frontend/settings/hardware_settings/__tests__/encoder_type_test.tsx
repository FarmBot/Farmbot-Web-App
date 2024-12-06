import React from "react";
import {
  EncoderType, EncoderTypeProps, LOOKUP, findByType, isEncoderValue,
} from "../encoder_type";
import { shallow } from "enzyme";
import { FBSelect } from "../../../ui";
import { Encoder } from "farmbot";

describe("<EncoderType/>", () => {
  const fakeProps = (): EncoderTypeProps => ({
    hardware: {
      encoder_type_x: 1,
      encoder_type_y: 1,
      encoder_type_z: 1
    },
    onChange: jest.fn(),
  });

  it("renders default content", () => {
    const wrapper = shallow(<EncoderType {...fakeProps()} />);
    expect(wrapper.find(FBSelect).length).toEqual(3);
  });

  it("changes encoder type", () => {
    const p = fakeProps();
    const wrapper = shallow(<EncoderType {...p} />);
    wrapper.find(FBSelect).first().simulate("change", { label: "", value: 1 });
    expect(p.onChange).toHaveBeenCalledWith("encoder_type_x", 1);
  });

  it("handles bad encoder type", () => {
    const p = fakeProps();
    const wrapper = shallow(<EncoderType {...p} />);
    const selection = wrapper.find(FBSelect).first();
    const change = () => selection.simulate("change", { label: "", value: 2 });
    expect(change).toThrow("Got bad encoder type in device panel.");
    expect(p.onChange).not.toHaveBeenCalled();
  });
});

describe("findByType", () => {
  it("handles undefined", () => {
    expect(findByType(undefined)).toBe(LOOKUP.DEFAULT);
  });

  it("Handles known values like Encoder.differential", () => {
    expect(findByType(Encoder.differential)).toBe(LOOKUP[Encoder.differential]);
  });

  it("Handles bad values like NaN", () => {
    expect(findByType(-99)).toBe(LOOKUP.DEFAULT);
  });
});

describe("isEncoderValue", () => {
  it("determines typefulness", () => {
    expect(isEncoderValue(-9)).toBeFalsy();
    expect(isEncoderValue(Encoder.quadrature)).toBeTruthy();
  });
});
