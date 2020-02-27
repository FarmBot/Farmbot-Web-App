jest.mock("../../../api/crud", () => ({ initSave: jest.fn() }));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawAddTool as AddTool, AddToolProps, mapStateToProps
} from "../add_tool";
import { fakeState } from "../../../__test_support__/fake_state";
import { SaveBtn } from "../../../ui";
import { initSave } from "../../../api/crud";
import { history } from "../../../history";
import { FirmwareHardware } from "farmbot";

describe("<AddTool />", () => {
  const fakeProps = (): AddToolProps => ({
    dispatch: jest.fn(),
    existingToolNames: [],
    firmwareHardware: undefined,
  });

  it("renders", () => {
    const wrapper = mount(<AddTool {...fakeProps()} />);
    expect(wrapper.text()).toContain("Add new");
  });

  it("edits tool name", () => {
    const wrapper = shallow<AddTool>(<AddTool {...fakeProps()} />);
    expect(wrapper.state().toolName).toEqual("");
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "new name" } });
    expect(wrapper.state().toolName).toEqual("new name");
  });

  it("saves", () => {
    const wrapper = shallow(<AddTool {...fakeProps()} />);
    wrapper.setState({ toolName: "Foo" });
    wrapper.find(SaveBtn).simulate("click");
    expect(initSave).toHaveBeenCalledWith("Tool", { name: "Foo" });
  });

  it.each<[FirmwareHardware, number]>([
    ["arduino", 6],
    ["farmduino", 6],
    ["farmduino_k14", 6],
    ["farmduino_k15", 8],
    ["express_k10", 2],
  ])("adds peripherals: %s", (firmware, expectedAdds) => {
    const p = fakeProps();
    p.firmwareHardware = firmware;
    const wrapper = mount(<AddTool {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(initSave).toHaveBeenCalledTimes(expectedAdds);
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools");
  });

  it("doesn't add stock tools twice", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.existingToolNames = ["Seed Trough 1"];
    const wrapper = mount(<AddTool {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(initSave).toHaveBeenCalledTimes(1);
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools");
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
    expect(wrapper.state().toAdd).toEqual(["Seed Trough 1", "Seed Trough 2"]);
    wrapper.find("input").last().simulate("change");
    expect(wrapper.state().toAdd).toEqual(["Seed Trough 1"]);
  });

  it("selects a tool", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount<AddTool>(<AddTool {...p} />);
    wrapper.setState({ toAdd: [] });
    wrapper.find("input").last().simulate("change");
    expect(wrapper.state().toAdd).toEqual(["Seed Trough 2"]);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
