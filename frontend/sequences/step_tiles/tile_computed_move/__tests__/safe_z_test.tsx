import React from "react";
import { mount } from "enzyme";
import { SafeZCheckboxProps } from "../interfaces";
import { SafeZCheckbox } from "../safe_z";

describe("<SafeZCheckbox />", () => {
  const fakeProps = (): SafeZCheckboxProps => ({
    checked: false,
    onChange: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<SafeZCheckbox {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("safe z");
  });
});
