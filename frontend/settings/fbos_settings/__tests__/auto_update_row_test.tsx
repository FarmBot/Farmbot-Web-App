import React from "react";
import { AutoUpdateRow } from "../auto_update_row";
import { mount } from "enzyme";
import { AutoUpdateRowProps } from "../interfaces";
import { ToggleButton } from "../../../ui";
import * as deviceActions from "../../../devices/actions";

let updateConfigSpy: jest.SpyInstance;

beforeEach(() => {
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn() as never);
});

afterEach(() => {
  updateConfigSpy.mockRestore();
});

describe("<AutoUpdateRow/>", () => {
  const fakeProps = (): AutoUpdateRowProps => ({
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: 1, consistent: true }),
  });

  it("renders", () => {
    const wrapper = mount(<AutoUpdateRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("auto update");
  });

  it("toggles auto-update on", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 0, consistent: true });
    const wrapper = mount(<AutoUpdateRow {...p} />);
    wrapper.find(ToggleButton).first().props().toggleAction();
    expect(updateConfigSpy).toHaveBeenCalledWith({ os_auto_update: true });
    expect(p.dispatch).toHaveBeenCalledWith(updateConfigSpy.mock.results[0].value);
  });

  it("toggles auto-update off", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 1, consistent: true });
    const wrapper = mount(<AutoUpdateRow {...p} />);
    wrapper.find(ToggleButton).first().props().toggleAction();
    expect(updateConfigSpy).toHaveBeenCalledWith({ os_auto_update: false });
    expect(p.dispatch).toHaveBeenCalledWith(updateConfigSpy.mock.results[0].value);
  });
});
