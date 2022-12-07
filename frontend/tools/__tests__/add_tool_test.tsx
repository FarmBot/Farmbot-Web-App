let mockSave = () => Promise.resolve();
jest.mock("../../api/crud", () => ({
  initSave: jest.fn(),
  init: jest.fn(() => ({ payload: { uuid: "fake uuid" } })),
  save: jest.fn(() => mockSave),
  destroy: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { RawAddTool as AddTool, mapStateToProps } from "../add_tool";
import { fakeState } from "../../__test_support__/fake_state";
import { SaveBtn } from "../../ui";
import { initSave, init, destroy } from "../../api/crud";
import { push } from "../../history";
import { FirmwareHardware } from "farmbot";
import { AddToolProps } from "../interfaces";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { Path } from "../../internal_urls";

describe("<AddTool />", () => {
  const fakeProps = (): AddToolProps => ({
    dispatch: jest.fn(),
    existingToolNames: [],
    firmwareHardware: undefined,
    saveFarmwareEnv: jest.fn(),
    env: {},
  });

  it("renders", () => {
    const wrapper = mount(<AddTool {...fakeProps()} />);
    expect(wrapper.text()).toContain("Add new");
    expect(wrapper.text().toLowerCase()).not.toContain("flow rate");
  });

  it("renders watering nozzle", () => {
    const wrapper = mount(<AddTool {...fakeProps()} />);
    wrapper.setState({ toolName: "watering nozzle" });
    expect(wrapper.text().toLowerCase()).toContain("flow rate");
  });

  it("changes flow rate", () => {
    const wrapper = shallow<AddTool>(<AddTool {...fakeProps()} />);
    expect(wrapper.state().flowRate).toEqual(0);
    wrapper.instance().changeFlowRate(1);
    expect(wrapper.state().flowRate).toEqual(1);
  });

  it("edits tool name", () => {
    const wrapper = shallow<AddTool>(<AddTool {...fakeProps()} />);
    expect(wrapper.state().toolName).toEqual("");
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "new name" } });
    expect(wrapper.state().toolName).toEqual("new name");
  });

  it("disables save until name in entered", () => {
    const wrapper = shallow<AddTool>(<AddTool {...fakeProps()} />);
    expect(wrapper.state().toolName).toEqual("");
    expect(wrapper.find("SaveBtn").first().props().disabled).toBeTruthy();
    wrapper.setState({ toolName: "fake tool name" });
    expect(wrapper.find("SaveBtn").first().props().disabled).toBeFalsy();
  });

  it("shows name collision message", () => {
    const p = fakeProps();
    p.existingToolNames = ["tool"];
    const wrapper = shallow<AddTool>(<AddTool {...p} />);
    wrapper.setState({ toolName: "tool" });
    expect(wrapper.find("p").first().text()).toEqual("Already added.");
    expect(wrapper.find("SaveBtn").first().props().disabled).toBeTruthy();
  });

  it("saves", async () => {
    mockSave = () => Promise.resolve();
    const p = fakeProps();
    p.dispatch = mockDispatch();
    const wrapper = shallow<AddTool>(<AddTool {...p} />);
    wrapper.setState({ toolName: "Foo" });
    await wrapper.find(SaveBtn).simulate("click");
    expect(init).toHaveBeenCalledWith("Tool", {
      name: "Foo", flow_rate_ml_per_s: 0,
    });
    expect(wrapper.state().uuid).toEqual(undefined);
    expect(push).toHaveBeenCalledWith(Path.tools());
  });

  it("removes unsaved tool on exit", async () => {
    mockSave = () => Promise.reject();
    const p = fakeProps();
    p.dispatch = mockDispatch();
    const wrapper = shallow<AddTool>(<AddTool {...p} />);
    wrapper.setState({ toolName: "Foo" });
    await wrapper.find(SaveBtn).simulate("click");
    expect(init).toHaveBeenCalledWith("Tool", {
      name: "Foo", flow_rate_ml_per_s: 0,
    });
    expect(wrapper.state().uuid).toEqual("fake uuid");
    expect(push).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(destroy).toHaveBeenCalledWith("fake uuid");
  });

  it.each<[FirmwareHardware, number]>([
    ["arduino", 6],
    ["farmduino", 6],
    ["farmduino_k14", 6],
    ["farmduino_k15", 8],
    ["farmduino_k16", 9],
    ["express_k10", 3],
    ["express_k11", 3],
  ])("adds peripherals: %s", (firmware, expectedAdds) => {
    const p = fakeProps();
    p.firmwareHardware = firmware;
    const wrapper = mount(<AddTool {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(initSave).toHaveBeenCalledTimes(expectedAdds);
    expect(push).toHaveBeenCalledWith(Path.tools());
  });

  it("doesn't add stock tools twice", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.existingToolNames = ["Seed Trough 1"];
    const wrapper = mount(<AddTool {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(initSave).toHaveBeenCalledTimes(2);
    expect(push).toHaveBeenCalledWith(Path.tools());
  });

  it("copies a tool name", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount<AddTool>(<AddTool {...p} />);
    wrapper.find("p").last().simulate("click");
    expect(wrapper.state().toolName).toEqual("Seed Trough 2");
  });

  it("deselects a tool", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount<AddTool>(<AddTool {...p} />);
    expect(wrapper.state().toAdd).toEqual([
      "Watering Nozzle", "Seed Trough 1", "Seed Trough 2",
    ]);
    wrapper.find("input").last().simulate("change");
    expect(wrapper.state().toAdd).toEqual(["Watering Nozzle", "Seed Trough 1"]);
  });

  it("selects a tool", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount<AddTool>(<AddTool {...p} />);
    wrapper.setState({ toAdd: [] });
    wrapper.find("input").last().simulate("change");
    expect(wrapper.state().toAdd).toEqual(["Seed Trough 2"]);
  });

  it("disables when all already added", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.existingToolNames = ["Seed Trough 1", "Seed Trough 2", "Watering Nozzle"];
    const wrapper = mount<AddTool>(<AddTool {...p} />);
    expect(wrapper.find("button").last().hasClass("pseudo-disabled"))
      .toBeTruthy();
  });

  it("hides when none firmware is selected", () => {
    const p = fakeProps();
    p.firmwareHardware = "none";
    const wrapper = mount<AddTool>(<AddTool {...p} />);
    expect(wrapper.find(".add-stock-tools").props().hidden).toBeTruthy();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
