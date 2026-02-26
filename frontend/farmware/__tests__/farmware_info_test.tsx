const mockDevice = { updateFarmware: jest.fn((_) => Promise.resolve({})) };

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { FarmwareInfoProps, FarmwareInfo } from "../farmware_info";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import {
  fakeFarmwareInstallation,
} from "../../__test_support__/fake_state/resources";
import { error } from "../../toast/toast";
import { Path } from "../../internal_urls";
import * as crud from "../../api/crud";
import * as deviceModule from "../../device";
import * as farmwareActions from "../actions";

beforeEach(() => {
  jest.clearAllMocks();
  mockDevice.updateFarmware = jest.fn((_) => Promise.resolve({}));
  jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
  jest.spyOn(crud, "destroy")
    .mockImplementation(jest.fn());
  jest.spyOn(farmwareActions, "retryFetchPackageName")
    .mockImplementation(jest.fn());
});

describe("<FarmwareInfo />", () => {
  const fakeProps = (): FarmwareInfoProps => ({
    farmware: fakeFarmware(),
    showFirstParty: false,
    firstPartyFarmwareNames: [],
    dispatch: jest.fn(),
    installations: [],
    botOnline: true,
  });

  const clickButton = (container: HTMLElement, label: string) => {
    const button = Array.from(container.querySelectorAll("button"))
      .find(el => el.textContent?.toLowerCase().includes(label.toLowerCase()));
    fireEvent.click(button as Element);
  };

  it("renders no manifest info message", () => {
    const p = fakeProps();
    p.farmware = undefined;
    const { container } = render(<FarmwareInfo {...p} />);
    expect(container.textContent).toEqual("Not available when device is offline.");
  });

  it("renders info", () => {
    const { container } = render(<FarmwareInfo {...fakeProps()} />);
    ["Description", "Version", "Language", "Author", "Manage"].map(string =>
      expect(container.textContent).toContain(string));
    expect(container.textContent).toContain("Does things.");
  });

  it("doesn't render farmware tools version", () => {
    const p = fakeProps();
    if (p.farmware) { p.farmware.meta.farmware_tools_version = "latest"; }
    const { container } = render(<FarmwareInfo {...p} />);
    expect(container.textContent).not.toContain("Farmware Tools version");
  });

  it("renders farmware tools version", () => {
    const p = fakeProps();
    if (p.farmware) { p.farmware.meta.farmware_tools_version = "1.0.0"; }
    const { container } = render(<FarmwareInfo {...p} />);
    expect(container.textContent).toContain("Farmware Tools version");
  });

  it("renders 1st-party author", () => {
    const p = fakeProps();
    p.farmware = fakeFarmware();
    p.farmware.meta.author = "Farmbot.io";
    const { container } = render(<FarmwareInfo {...p} />);
    expect(container.textContent).toContain("FarmBot, Inc.");
  });

  it("updates Farmware", () => {
    const { container } = render(<FarmwareInfo {...fakeProps()} />);
    clickButton(container, "Update");
    expect(mockDevice.updateFarmware).toHaveBeenCalledWith("My Fake Farmware");
  });

  it("doesn't update Farmware: offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    p.farmware = fakeFarmware();
    const { container } = render(<FarmwareInfo {...p} />);
    clickButton(container, "Update");
    expect(mockDevice.updateFarmware).not.toHaveBeenCalled();
  });

  it("doesn't update Farmware: missing name", () => {
    const p = fakeProps();
    p.farmware = fakeFarmware();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.farmware.name = undefined as any;
    const { container } = render(<FarmwareInfo {...p} />);
    clickButton(container, "Update");
    expect(mockDevice.updateFarmware).not.toHaveBeenCalled();
  });

  it("removes Farmware from API", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    p.installations = [fakeFarmwareInstallation()];
    const { container } = render(<FarmwareInfo {...p} />);
    clickButton(container, "Remove");
    expect(crud.destroy).toHaveBeenCalledWith(p.installations[0].uuid);
    expect(mockNavigate).toHaveBeenCalledWith(Path.farmware());
  });

  it("doesn't remove Farmware from API", () => {
    window.confirm = jest.fn(() => false);
    const p = fakeProps();
    p.farmware && (p.farmware.name = "fake");
    p.dispatch = jest.fn(() => Promise.resolve());
    p.installations = [fakeFarmwareInstallation()];
    p.firstPartyFarmwareNames = ["fake"];
    const { container } = render(<FarmwareInfo {...p} />);
    clickButton(container, "Remove");
    expect(crud.destroy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("errors during removal of Farmware from API: not found", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    p.installations = [];
    const { container } = render(<FarmwareInfo {...p} />);
    clickButton(container, "Remove");
    expect(crud.destroy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Farmware not found.");
  });

  it("errors during removal of Farmware from API: no url", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    p.installations = [fakeFarmwareInstallation()];
    if (p.farmware) { p.farmware.url = ""; }
    const { container } = render(<FarmwareInfo {...p} />);
    clickButton(container, "Remove");
    expect(crud.destroy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Farmware not found.");
  });

  it("errors removal of Farmware from API: rejected promise", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.reject("error"));
    p.installations = [fakeFarmwareInstallation()];
    const { container } = render(<FarmwareInfo {...p} />);
    clickButton(container, "Remove");
    expect(crud.destroy).toHaveBeenCalled();
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith("Farmware not found."));
  });

  it("displays package name fetch error", () => {
    const p = fakeProps();
    const farmwareInstallation = fakeFarmwareInstallation();
    farmwareInstallation.body.package_error = "package name fetch error";
    p.installations = [farmwareInstallation];
    const { container } = render(<FarmwareInfo {...p} />);
    expect(container.textContent).toContain(farmwareInstallation.body.package_error);
    expect(container.innerHTML).toContain("error-with-button");
  });

  it("retries package name fetch", () => {
    const p = fakeProps();
    const farmwareInstallation = fakeFarmwareInstallation();
    farmwareInstallation.body.package_error = "package name fetch error";
    p.installations = [farmwareInstallation];
    const { container } = render(<FarmwareInfo {...p} />);
    clickButton(container, "retry");
    expect(farmwareActions.retryFetchPackageName)
      .toHaveBeenCalledWith(farmwareInstallation.body.id);
  });

  it("doesn't display package name fetch error", () => {
    const p = fakeProps();
    const farmwareInstallation = fakeFarmwareInstallation();
    farmwareInstallation.body.package_error = undefined;
    p.installations = [farmwareInstallation];
    const { container } = render(<FarmwareInfo {...p} />);
    expect(container.innerHTML).not.toContain("error-with-button");
  });

  it("doesn't display version string", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    farmware.meta.version = "";
    farmware.meta.farmware_tools_version = "";
    farmware.meta.fbos_version = "";
    p.farmware = farmware;
    const { container } = render(<FarmwareInfo {...p} />);
    expect(container.textContent).not.toContain(".0.0");
  });

  it("displays version string", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    farmware.meta.version = "";
    farmware.meta.fbos_version = ">=1.0.0";
    p.farmware = farmware;
    const { container } = render(<FarmwareInfo {...p} />);
    expect(container.textContent).toContain(">=1.0.0");
  });
});
