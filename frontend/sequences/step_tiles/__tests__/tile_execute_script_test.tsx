import React from "react";
import {
  DefaultFarmwareStep, FarmwareName, TileExecuteScript,
} from "../tile_execute_script";
import { mount, shallow } from "enzyme";
import { ExecuteScript } from "farmbot";
import { StepParams } from "../../interfaces";
import { Actions } from "../../../constants";
import {
  fakeFarmwareData, fakeStepParams,
} from "../../../__test_support__/fake_sequence_step_data";

describe("<TileExecuteScript />", () => {
  const fakeProps = (): StepParams<ExecuteScript> => {
    const farmwareData = fakeFarmwareData();
    farmwareData.farmwareNames = ["one", "two", "three"];
    farmwareData.firstPartyFarmwareNames = ["one"];
    farmwareData.farmwareConfigs = { "farmware-to-execute": [] };
    return {
      ...fakeStepParams({
        kind: "execute_script",
        args: { label: "farmware-to-execute" }
      }),
      farmwareData,
    };
  };

  it("renders inputs", () => {
    const wrapper = mount(<TileExecuteScript {...fakeProps()} />);
    const inputs = wrapper.find("input");
    const labels = wrapper.find("label");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(2);
    expect(inputs.first().props().placeholder).toEqual("Run Farmware");
    expect(labels.at(0).text()).toEqual("Package Name");
    expect(labels.at(1).text()).toEqual("Manual input");
    expect(inputs.at(1).props().value).toEqual("farmware-to-execute");
  });

  it("renders farmware list", () => {
    const wrapper = shallow(<DefaultFarmwareStep {...fakeProps()} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "two", value: "two" },
      { label: "three", value: "three" },
    ]);
  });

  it("doesn't show 1st party in list", () => {
    const p = fakeProps();
    p.farmwareData && (p.farmwareData.showFirstPartyFarmware = true);
    const wrapper = shallow(<DefaultFarmwareStep {...p} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "two", value: "two" },
      { label: "three", value: "three" },
    ]);
  });

  it("doesn't show manual input if installed farmware is selected", () => {
    const p = fakeProps();
    p.currentStep.args.label = "two";
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.find("label").length).toEqual(1);
  });

  it("shows special 1st-party Farmware name: plant detection", () => {
    const p = fakeProps();
    p.currentStep.args.label = FarmwareName.PlantDetection;
    p.farmwareData?.farmwareNames.push(FarmwareName.PlantDetection);
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.find("label").length).toEqual(0);
    expect(wrapper.text().toLowerCase())
      .toContain("results are viewable from the photos panel.");
    expect(wrapper.text().toLowerCase()).not.toContain("package");
  });

  it("shows special 1st-party Farmware name: measure soil height", () => {
    const p = fakeProps();
    p.currentStep.args.label = FarmwareName.MeasureSoilHeight;
    p.farmwareData?.farmwareNames.push(FarmwareName.MeasureSoilHeight);
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.find("label").length).toEqual(0);
    expect(wrapper.text().toLowerCase())
      .toContain("results are viewable in the points panel.");
    expect(wrapper.text().toLowerCase()).not.toContain("package");
  });

  it("renders manual input", () => {
    const p = fakeProps();
    p.farmwareData = undefined;
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.find("button").text()).toEqual("Manual Input");
    expect(wrapper.find("label").at(1).text()).toEqual("Manual input");
    expect(wrapper.find("input").at(1).props().value)
      .toEqual("farmware-to-execute");
  });

  it("uses drop-down to update step", () => {
    const p = fakeProps();
    const wrapper = shallow(<DefaultFarmwareStep {...p} />);
    wrapper.find("FBSelect").simulate("change", {
      label: "farmware-name",
      value: "farmware-name"
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        update: expect.objectContaining({
          body: [{ kind: "execute_script", args: { label: "farmware-name" } }]
        })
      }),
      type: Actions.OVERWRITE_RESOURCE
    });
  });

  it("clears body when switching Farmware", () => {
    const p = fakeProps();
    p.currentStep.body = [
      { kind: "pair", args: { label: "x", value: 1 }, comment: "X" }];
    const wrapper = shallow(<DefaultFarmwareStep {...p} />);
    wrapper.find("FBSelect").simulate("change", {
      label: "farmware-name",
      value: "farmware-name"
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        update: expect.objectContaining({
          body: [{ kind: "execute_script", args: { label: "farmware-name" } }]
        })
      }),
      type: Actions.OVERWRITE_RESOURCE
    });
  });

  it("displays warning when camera is disabled", () => {
    const p = fakeProps();
    p.currentStep.args.label = FarmwareName.PlantDetection;
    p.farmwareData && (p.farmwareData.cameraDisabled = true);
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.html()).toContain("fa-exclamation-triangle");
  });

  it("displays warning when camera is uncalibrated", () => {
    const p = fakeProps();
    p.currentStep.args.label = FarmwareName.PlantDetection;
    p.farmwareData && (p.farmwareData.cameraCalibrated = false);
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.html()).toContain("fa-exclamation-triangle");
  });
});
