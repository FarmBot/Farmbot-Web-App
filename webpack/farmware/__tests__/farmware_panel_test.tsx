jest.mock("../../device", () => ({
  devices: {
    current: {
      installFarmware: jest.fn(() => { return Promise.resolve(); }),
      updateFarmware: jest.fn(() => { return Promise.resolve(); }),
      removeFarmware: jest.fn(() => { return Promise.resolve(); }),
      execScript: jest.fn(() => { return Promise.resolve(); })
    }
  }
}));

import * as React from "react";
import { mount } from "enzyme";
import { devices } from "../../device";
import { FarmwarePanel } from "../farmware_panel";

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
    let { mock } = devices.current.installFarmware as jest.Mock<{}>;
    let panel = bootstrapTest();
    let buttons = panel.component.find("button");
    expect(buttons.at(0).text()).toEqual("Install");
    panel.component.setState({ packageUrl: "install this" });
    buttons.at(0).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("install this");
  });

  it("calls update", () => {
    let { mock } = devices.current.updateFarmware as jest.Mock<{}>;
    let panel = bootstrapTest();
    let buttons = panel.component.find("button");
    expect(buttons.at(3).text()).toEqual("Update");
    panel.component.setState({ selectedFarmware: "update this" });
    buttons.at(3).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("update this");
  });

  it("calls remove", () => {
    let { mock } = devices.current.removeFarmware as jest.Mock<{}>;
    let panel = bootstrapTest();
    let buttons = panel.component.find("button");
    expect(buttons.at(2).text()).toEqual("Remove");
    panel.component.setState({ selectedFarmware: "remove this" });
    buttons.at(2).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("remove this");
  });

  it("calls run", () => {
    let { mock } = devices.current.execScript as jest.Mock<{}>;
    let panel = bootstrapTest();
    let buttons = panel.component.find("button");
    expect(buttons.at(4).text()).toEqual("Run");
    panel.component.setState({ selectedFarmware: "run this" });
    buttons.at(4).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("run this");
  });
});
