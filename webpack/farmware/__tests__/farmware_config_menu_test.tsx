const mockDevice = {
  installFarmware: jest.fn(() => Promise.resolve()),
  updateFarmware: jest.fn(() => Promise.resolve()),
  removeFarmware: jest.fn(() => Promise.resolve()),
  execScript: jest.fn(() => Promise.resolve()),
  installFirstPartyFarmware: jest.fn(() => Promise.resolve())
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("../../config_storage/actions", () => ({
  toggleWebAppBool: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { FarmwareConfigMenu } from "../farmware_config_menu";
import { FarmwareConfigMenuProps } from "../interfaces";
import { getDevice } from "../../device";
import { toggleWebAppBool } from "../../config_storage/actions";

describe("<FarmwareConfigMenu />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function fakeProps(): FarmwareConfigMenuProps {
    return {
      show: true,
      dispatch: jest.fn(),
      firstPartyFwsInstalled: false
    };
  }

  it("calls install 1st party farmwares", () => {
    const wrapper = mount<{}>(<FarmwareConfigMenu {...fakeProps()} />);
    const button = wrapper.find("button").first();
    expect(button.hasClass("fa-download")).toBeTruthy();
    button.simulate("click");
  });

  it("1st party farmwares all installed", () => {
    const p = fakeProps();
    p.firstPartyFwsInstalled = true;
    const wrapper = mount(
      <FarmwareConfigMenu {...p} />);
    const button = wrapper.find("button").first();
    expect(button.hasClass("fa-download")).toBeTruthy();
    button.simulate("click");
    expect(getDevice().installFirstPartyFarmware).not.toHaveBeenCalled();
  });

  it("toggles 1st party farmware display", () => {
    const wrapper = mount(
      <FarmwareConfigMenu {...fakeProps()} />);
    const button = wrapper.find("button").last();
    expect(button.hasClass("green")).toBeTruthy();
    expect(button.hasClass("fb-toggle-button")).toBeTruthy();
    button.simulate("click");
    expect(toggleWebAppBool).toHaveBeenCalledWith("show_first_party_farmware");
  });

  it("1st party farmware display is disabled", () => {
    const p = fakeProps();
    p.show = false;
    const wrapper = mount(
      <FarmwareConfigMenu {...p} />);
    const button = wrapper.find("button").last();
    expect(button.hasClass("red")).toBeTruthy();
  });
});
