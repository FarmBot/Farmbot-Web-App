const mockDevice = {
  installFarmware: jest.fn(() => { return Promise.resolve(); }),
  updateFarmware: jest.fn(() => { return Promise.resolve(); }),
  removeFarmware: jest.fn(() => { return Promise.resolve(); }),
  execScript: jest.fn(() => { return Promise.resolve(); }),
  installFirstPartyFarmware: jest.fn(),
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount } from "enzyme";
import { getDevice } from "../../device";
import { FarmwarePanel, FarmwareConfigMenu } from "../farmware_panel";

describe("<FarmwarePanel/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function bootstrapTest() {
    const farmwares = {};
    return {
      component: mount(<FarmwarePanel
        syncStatus={"synced"}
        farmwares={farmwares} />)
    };
  }

  it("calls install", () => {
    const { mock } = getDevice().installFarmware as jest.Mock<{}>;
    const panel = bootstrapTest();
    const buttons = panel.component.find("button");
    expect(buttons.at(0).text()).toEqual("Install");
    panel.component.setState({ packageUrl: "install this" });
    buttons.at(0).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("install this");
  });

  it("calls update", () => {
    const { mock } = getDevice().updateFarmware as jest.Mock<{}>;
    const panel = bootstrapTest();
    const buttons = panel.component.find("button");
    expect(buttons.at(3).text()).toEqual("Update");
    panel.component.setState({ selectedFarmware: "update this" });
    buttons.at(3).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("update this");
  });

  it("calls remove", () => {
    const { mock } = getDevice().removeFarmware as jest.Mock<{}>;
    const panel = bootstrapTest();
    const buttons = panel.component.find("button");
    expect(buttons.at(2).text()).toEqual("Remove");
    panel.component.setState({ selectedFarmware: "remove this" });
    buttons.at(2).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("remove this");
  });

  it("calls run", () => {
    const { mock } = getDevice().execScript as jest.Mock<{}>;
    const panel = bootstrapTest();
    const buttons = panel.component.find("button");
    expect(buttons.at(4).text()).toEqual("Run");
    panel.component.setState({ selectedFarmware: "run this" });
    buttons.at(4).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("run this");
  });
});

describe("<FarmwareConfigMenu />", () => {
  it("calls install 1st party farmwares", () => {
    const firstParty = getDevice().installFirstPartyFarmware;
    const wrapper = mount(<FarmwareConfigMenu />);
    const button = wrapper.find("button");
    expect(button.hasClass("fa-download")).toBeTruthy();
    button.simulate("click");
    expect(firstParty).toHaveBeenCalled();
  });
});
