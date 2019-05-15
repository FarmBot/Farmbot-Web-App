import * as React from "react";
import { TileExecuteScript } from "../tile_execute_script";
import { mount, shallow } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { ExecuteScript } from "farmbot/dist";
import { StepParams } from "../../interfaces";
import { Actions } from "../../../constants";
import { emptyState } from "../../../resources/reducer";

describe("<TileExecuteScript/>", () => {
  const fakeProps = (): StepParams => {
    const currentStep: ExecuteScript = {
      kind: "execute_script",
      args: {
        label: "farmware-to-execute"
      }
    };
    return {
      currentSequence: fakeSequence(),
      currentStep,
      dispatch: jest.fn(),
      index: 0,
      resources: emptyState().index,
      farmwareInfo: {
        farmwareNames: ["one", "two", "three"],
        firstPartyFarmwareNames: ["one"],
        showFirstPartyFarmware: false,
        farmwareConfigs: { "farmware-to-execute": [] },
      },
      confirmStepDeletion: false,
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

  it("renders error on wrong step", () => {
    const p = fakeProps();
    p.currentStep = { kind: "wait", args: { milliseconds: 100 } };
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.text()).toContain("ERROR");
  });

  it("renders farmware list", () => {
    const wrapper = shallow(<TileExecuteScript {...fakeProps()} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "two", value: "two" },
      { label: "three", value: "three" },
      { label: "Weed Detector", value: "plant-detection" },
    ]);
  });

  it("shows 1st party in list", () => {
    const p = fakeProps();
    p.farmwareInfo && (p.farmwareInfo.showFirstPartyFarmware = true);
    const wrapper = shallow(<TileExecuteScript {...p} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "one", value: "one" },
      { label: "two", value: "two" },
      { label: "three", value: "three" },
      { label: "Weed Detector", value: "plant-detection" },
    ]);
  });

  it("doesn't show manual input if installed farmware is selected", () => {
    const p = fakeProps();
    (p.currentStep as ExecuteScript).args.label = "two";
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.find("label").length).toEqual(1);
  });

  it("shows special 1st-party Farmware name", () => {
    const p = fakeProps();
    (p.currentStep as ExecuteScript).args.label = "plant-detection";
    p.farmwareInfo && p.farmwareInfo.farmwareNames.push("plant-detection");
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.find("label").length).toEqual(1);
    expect(wrapper.text()).toContain("Weed Detector");
  });

  it("renders manual input", () => {
    const p = fakeProps();
    p.farmwareInfo = undefined;
    const wrapper = mount(<TileExecuteScript {...p} />);
    expect(wrapper.find("button").text()).toEqual("Manual Input");
    expect(wrapper.find("label").at(1).text()).toEqual("Manual input");
    expect(wrapper.find("input").at(1).props().value).toEqual("farmware-to-execute");
  });

  it("uses drop-down to update step", () => {
    const p = fakeProps();
    const wrapper = shallow(<TileExecuteScript {...p} />);
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
    const wrapper = shallow(<TileExecuteScript {...p} />);
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
});
