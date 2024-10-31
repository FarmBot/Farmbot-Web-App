const mockDevice = { updateFarmware: jest.fn((_) => Promise.resolve({})) };
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../api/crud", () => ({ destroy: jest.fn() }));

jest.mock("../actions", () => ({ retryFetchPackageName: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import { FarmwareInfoProps, FarmwareInfo } from "../farmware_info";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { clickButton } from "../../__test_support__/helpers";
import { destroy } from "../../api/crud";
import {
  fakeFarmwareInstallation,
} from "../../__test_support__/fake_state/resources";
import { error } from "../../toast/toast";
import { retryFetchPackageName } from "../actions";
import { Path } from "../../internal_urls";

describe("<FarmwareInfo />", () => {
  const fakeProps = (): FarmwareInfoProps => ({
    farmware: fakeFarmware(),
    showFirstParty: false,
    firstPartyFarmwareNames: [],
    dispatch: jest.fn(),
    installations: [],
    botOnline: true,
  });

  it("renders no manifest info message", () => {
    const p = fakeProps();
    p.farmware = undefined;
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).toEqual("Not available when device is offline.");
  });

  it("renders info", () => {
    const wrapper = mount(<FarmwareInfo {...fakeProps()} />);
    ["Description", "Version", "Language", "Author", "Manage"].map(string =>
      expect(wrapper.text()).toContain(string));
    expect(wrapper.text()).toContain("Does things.");
  });

  it("doesn't render farmware tools version", () => {
    const p = fakeProps();
    if (p.farmware) { p.farmware.meta.farmware_tools_version = "latest"; }
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).not.toContain("Farmware Tools version");
  });

  it("renders farmware tools version", () => {
    const p = fakeProps();
    if (p.farmware) { p.farmware.meta.farmware_tools_version = "1.0.0"; }
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).toContain("Farmware Tools version");
  });

  it("renders 1st-party author", () => {
    const p = fakeProps();
    p.farmware = fakeFarmware();
    p.farmware.meta.author = "Farmbot.io";
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).toContain("FarmBot, Inc.");
  });

  it("updates Farmware", () => {
    const wrapper = mount(<FarmwareInfo {...fakeProps()} />);
    clickButton(wrapper, 0, "Update");
    expect(mockDevice.updateFarmware).toHaveBeenCalledWith("My Fake Farmware");
  });

  it("doesn't update Farmware: offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    p.farmware = fakeFarmware();
    const wrapper = mount(<FarmwareInfo {...p} />);
    clickButton(wrapper, 0, "Update");
    expect(mockDevice.updateFarmware).not.toHaveBeenCalled();
  });

  it("doesn't update Farmware: missing name", () => {
    const p = fakeProps();
    p.farmware = fakeFarmware();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.farmware.name = undefined as any;
    const wrapper = mount(<FarmwareInfo {...p} />);
    clickButton(wrapper, 0, "Update");
    expect(mockDevice.updateFarmware).not.toHaveBeenCalled();
  });

  it("removes Farmware from API", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    p.installations = [fakeFarmwareInstallation()];
    const wrapper = mount(<FarmwareInfo {...p} />);
    clickButton(wrapper, 1, "Remove");
    expect(destroy).toHaveBeenCalledWith(p.installations[0].uuid);
    expect(mockNavigate).toHaveBeenCalledWith(Path.farmware());
  });

  it("doesn't remove Farmware from API", () => {
    window.confirm = () => false;
    const p = fakeProps();
    p.farmware && (p.farmware.name = "fake");
    p.dispatch = jest.fn(() => Promise.resolve());
    p.installations = [fakeFarmwareInstallation()];
    p.firstPartyFarmwareNames = ["fake"];
    const wrapper = mount(<FarmwareInfo {...p} />);
    clickButton(wrapper, 1, "Remove");
    expect(destroy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("errors during removal of Farmware from API: not found", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    p.installations = [];
    const wrapper = mount(<FarmwareInfo {...p} />);
    clickButton(wrapper, 1, "Remove");
    expect(destroy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Farmware not found.");
  });

  it("errors during removal of Farmware from API: no url", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    p.installations = [fakeFarmwareInstallation()];
    if (p.farmware) { p.farmware.url = ""; }
    const wrapperNoUrl = mount(<FarmwareInfo {...p} />);
    clickButton(wrapperNoUrl, 1, "Remove");
    expect(destroy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Farmware not found.");
  });

  it("errors during removal of Farmware from API: rejected promise", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.reject("error"));
    p.installations = [fakeFarmwareInstallation()];
    const wrapper = mount(<FarmwareInfo {...p} />);
    clickButton(wrapper, 1, "Remove");
    await expect(destroy).toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Farmware not found.");
  });

  it("displays package name fetch error", () => {
    const p = fakeProps();
    const farmwareInstallation = fakeFarmwareInstallation();
    farmwareInstallation.body.package_error = "package name fetch error";
    p.installations = [farmwareInstallation];
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).toContain(farmwareInstallation.body.package_error);
    expect(wrapper.html()).toContain("error-with-button");
  });

  it("retries package name fetch", () => {
    const p = fakeProps();
    const farmwareInstallation = fakeFarmwareInstallation();
    farmwareInstallation.body.package_error = "package name fetch error";
    p.installations = [farmwareInstallation];
    const wrapper = mount(<FarmwareInfo {...p} />);
    clickButton(wrapper, 2, "retry");
    expect(retryFetchPackageName)
      .toHaveBeenCalledWith(farmwareInstallation.body.id);
  });

  it("doesn't display package name fetch error", () => {
    const p = fakeProps();
    const farmwareInstallation = fakeFarmwareInstallation();
    farmwareInstallation.body.package_error = undefined;
    p.installations = [farmwareInstallation];
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.html()).not.toContain("error-with-button");
  });

  it("doesn't display version string", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    farmware.meta.version = "";
    farmware.meta.farmware_tools_version = "";
    farmware.meta.fbos_version = "";
    p.farmware = farmware;
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).not.toContain(".0.0");
  });

  it("displays version string", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    farmware.meta.version = "";
    farmware.meta.fbos_version = ">=1.0.0";
    p.farmware = farmware;
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).toContain(">=1.0.0");
  });
});
