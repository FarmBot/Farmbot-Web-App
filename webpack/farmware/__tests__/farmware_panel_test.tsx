const mockDevice = {
  installFarmware: jest.fn(() => Promise.resolve()),
  updateFarmware: jest.fn(() => Promise.resolve()),
  removeFarmware: jest.fn(() => Promise.resolve()),
  execScript: jest.fn(() => Promise.resolve()),
  installFirstPartyFarmware: jest.fn(() => {
    debugger;
    return Promise.resolve({});
  })
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { FarmwarePanel, FarmwareConfigMenu } from "../farmware_panel";
import { FWProps, FarmwareConfigMenuProps } from "../interfaces";
import { fakeFarmwares } from "../../__test_support__/fake_farmwares";

describe("<FarmwarePanel/>: actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function fakeProps(): FWProps {
    let showFirstParty = true;
    return {
      farmwares: {},
      botToMqttStatus: "up",
      syncStatus: "synced",
      onToggle: jest.fn(() => showFirstParty = !showFirstParty),
      showFirstParty,
      firstPartyFarmwareNames: ["first-party farmware"]
    };
  }

  it("calls install", () => {
    const panel = mount(<FarmwarePanel {...fakeProps()} />);
    const buttons = panel.find("button");
    expect(buttons.at(0).text()).toEqual("Install");
    panel.setState({ packageUrl: "install this" });
    buttons.at(0).simulate("click");
    expect(mockDevice.installFarmware).toHaveBeenCalledWith("install this");
  });

  it("farmware not selected", () => {
    const panel = mount(<FarmwarePanel {...fakeProps()} />);
    panel.setState({ selectedFarmware: undefined });
    const updateBtn = panel.find("button").at(3);
    expect(updateBtn.text()).toEqual("Update");
    updateBtn.simulate("click");
    expect(mockDevice.updateFarmware).not.toHaveBeenCalled();
    const installBtn = panel.find("button").at(0);
    expect(installBtn.text()).toEqual("Install");
    installBtn.simulate("click");
    expect(mockDevice.installFarmware).not.toHaveBeenCalled();
  });

  it("calls update", () => {
    const panel = mount(<FarmwarePanel {...fakeProps()} />);
    const buttons = panel.find("button");
    expect(buttons.at(3).text()).toEqual("Update");
    panel.setState({ selectedFarmware: "update this" });
    buttons.at(3).simulate("click");
    expect(mockDevice.updateFarmware).toHaveBeenCalledWith("update this");
  });

  it("calls remove", () => {
    const panel = mount(<FarmwarePanel {...fakeProps()} />);
    const removeBtn = panel.find("button").at(2);
    expect(removeBtn.text()).toEqual("Remove");
    panel.setState({ selectedFarmware: "remove this" });
    removeBtn.simulate("click");
    expect(mockDevice.removeFarmware).toHaveBeenCalledTimes(1);
    expect(mockDevice.removeFarmware).toHaveBeenCalledWith("remove this");
    panel.setState({ selectedFarmware: "first-party farmware" });
    removeBtn.simulate("click");
    expect(mockDevice.removeFarmware).toHaveBeenCalledTimes(1);
    // tslint:disable-next-line:no-any
    (global as any).confirm = () => true;
    removeBtn.simulate("click");
    expect(mockDevice.removeFarmware).toHaveBeenCalledTimes(2);
    expect(mockDevice.removeFarmware).toHaveBeenLastCalledWith("first-party farmware");
  });

  it("calls run", () => {
    const panel = mount(<FarmwarePanel {...fakeProps()} />);
    const buttons = panel.find("button");
    expect(buttons.at(4).text()).toEqual("Run");
    panel.setState({ selectedFarmware: "run this" });
    buttons.at(4).simulate("click");
    expect(mockDevice.execScript).toHaveBeenCalledWith("run this");
  });

  it("sets url to install", () => {
    const panel = shallow(<FarmwarePanel {...fakeProps()} />);
    const input = panel.find("input").first();
    input.simulate("change", { currentTarget: { value: "inputted url" } });
    expect(panel.state().packageUrl).toEqual("inputted url");
  });

  it("selects a farmware", () => {
    const panel = shallow(<FarmwarePanel {...fakeProps()} />);
    const dropdown = panel.find("FBSelect").first();
    dropdown.simulate("change", { value: "selected farmware" });
    expect(panel.state().selectedFarmware).toEqual("selected farmware");
    const badInputValue = () => dropdown.simulate("change", { value: 5 });
    expect(badInputValue).toThrowError("Bad farmware name: 5");
  });
});

describe("<FarmwarePanel/>: farmware list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function fakeProps(): FWProps {
    let showFirstParty = true;
    return {
      botToMqttStatus: "up",
      farmwares: fakeFarmwares(),
      syncStatus: "synced",
      onToggle: jest.fn(() => showFirstParty = !showFirstParty),
      showFirstParty,
      firstPartyFarmwareNames: ["first-party farmware"]
    };
  }

  it("lists farmware", () => {
    const p = fakeProps();
    p.showFirstParty = false;
    const firstPartyFarmware = fakeFarmwares().farmware_0;
    if (firstPartyFarmware) { firstPartyFarmware.name = "first-party farmware"; }
    p.farmwares.farmware_1 = firstPartyFarmware;
    const panel = shallow(<FarmwarePanel {...p} />);
    expect(panel.find("FBSelect").props().list).toEqual([{
      label: "My Farmware 0.0.0", value: "My Farmware"
    }]);
    panel.setProps({ showFirstParty: true });
    expect(panel.find("FBSelect").props().list).toEqual([
      { label: "My Farmware 0.0.0", value: "My Farmware" },
      { label: "first-party farmware 0.0.0", value: "first-party farmware" }
    ]);
  });

  it("toggles first party farmware display", () => {
    jest.resetAllMocks();
    const p = fakeProps();
    const panel = shallow(<FarmwarePanel {...p} />);
    panel.find(FarmwareConfigMenu).simulate("toggle", {});
    expect(p.onToggle).toHaveBeenCalled();
  });

  it("displays description", () => {
    const p = fakeProps();
    const otherFarmware = fakeFarmwares().farmware_0;
    if (otherFarmware) {
      otherFarmware.name = "My Other Farmware";
      otherFarmware.meta.description = "Does other things.";
    }
    p.farmwares.farmware_1 = otherFarmware;
    const panel = mount(<FarmwarePanel {...p} />);
    expect(panel.text()).not.toContain("Does things.");
    panel.setState({ selectedFarmware: "My Farmware" });
    expect(panel.text()).toContain("Does things.");
    expect(panel.text()).not.toContain("Does other things.");
  });

  it("all 1st party farmwares are installed", () => {
    const panel = shallow(<FarmwarePanel {...fakeProps()} />);
    // tslint:disable-next-line:no-any
    const instance = panel.instance() as any;
    const allInstalled = instance.firstPartyFarmwaresPresent([
      "My Farmware"]);
    expect(allInstalled).toBeTruthy();
  });

  it("some 1st party farmwares are missing", () => {
    const panel = shallow(<FarmwarePanel {...fakeProps()} />);
    // tslint:disable-next-line:no-any
    const instance = panel.instance() as any;
    const allInstalled = instance.firstPartyFarmwaresPresent([
      "My Farmware", "Other Farmware"]);
    expect(allInstalled).toBeFalsy();
  });
});

describe("<FarmwareConfigMenu />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function fakeProps(): FarmwareConfigMenuProps {
    return {
      show: true,
      onToggle: jest.fn(),
      firstPartyFwsInstalled: false
    };
  }

  it("calls install 1st party farmwares", () => {
    const wrapper = mount(
      <FarmwareConfigMenu {...fakeProps()} />);
    const button = wrapper.find("button").first();
    expect(button.hasClass("fa-download")).toBeTruthy();
    button.simulate("click");
    expect(mockDevice.installFirstPartyFarmware).toHaveBeenCalled();
  });

  it("1st party farmwares all installed", () => {
    const p = fakeProps();
    p.firstPartyFwsInstalled = true;
    const wrapper = mount(
      <FarmwareConfigMenu {...p} />);
    const button = wrapper.find("button").first();
    expect(button.hasClass("fa-download")).toBeTruthy();
    button.simulate("click");
    expect(mockDevice.installFirstPartyFarmware).not.toHaveBeenCalled();
  });

  it("toggles 1st party farmware display", () => {
    const p = fakeProps();
    const wrapper = mount(
      <FarmwareConfigMenu {...p} />);
    const button = wrapper.find("button").last();
    expect(button.hasClass("green")).toBeTruthy();
    expect(button.hasClass("fb-toggle-button")).toBeTruthy();
    button.simulate("click");
    expect(p.onToggle).toHaveBeenCalled();
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
