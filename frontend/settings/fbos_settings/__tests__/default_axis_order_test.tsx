import React from "react";
import { shallow } from "enzyme";
import { DefaultAxisOrder } from "../default_axis_order";
import { DefaultAxisOrderProps } from "../interfaces";
import * as deviceActions from "../../../devices/actions";

let updateConfigSpy: jest.SpyInstance;

beforeEach(() => {
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  updateConfigSpy.mockRestore();
});

describe("<DefaultAxisOrder />", () => {
  const fakeProps = (): DefaultAxisOrderProps => ({
    sourceFbosConfig: () => ({ value: "safe_z", consistent: true }),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = shallow(<DefaultAxisOrder {...p} />);
    const selected = wrapper.find("FBSelect").props().selectedItem;
    expect(selected?.label).toEqual("Safe Z");
    const onChange = wrapper.find("FBSelect").props().onChange;
    onChange?.({ label: "X and Y together", value: "xy,z;high" });
    expect(deviceActions.updateConfig)
      .toHaveBeenCalledWith({ default_axis_order: "xy,z;high" });
  });
});
