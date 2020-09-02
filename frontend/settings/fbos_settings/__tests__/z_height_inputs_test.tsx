import React from "react";
import { mount } from "enzyme";
import { SafeHeight, SoilHeight } from "../z_height_inputs";
import { ZHeightInputProps } from "../interfaces";

describe("<SafeHeight />", () => {
  const fakeProps = (): ZHeightInputProps => ({
    sourceFbosConfig: () => ({ value: 10, consistent: true }),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<SafeHeight {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("safe height");
  });
});

describe("<SoilHeight />", () => {
  const fakeProps = (): ZHeightInputProps => ({
    sourceFbosConfig: () => ({ value: 10, consistent: true }),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<SoilHeight {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("soil height");
  });
});
