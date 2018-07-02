import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  FarmwareInputsProps, FarmwareInputs
} from "../tile_execute_script_support";

describe("<FarmwareInputs />", () => {
  const fakeProps = (): FarmwareInputsProps => {
    return {
      farmwareName: "my farmware",
      currentStep: {
        kind: "execute_script",
        args: { label: "my farmware" },
        body: [{
          kind: "pair",
          args: { label: "my_farmware_input_1", value: 1 },
          comment: "Input 1"
        }]
      },
      farmwareInstalled: true,
      defaultConfigs: [{ name: "input_1", label: "Input 1", value: "1" }],
      updateStep: jest.fn(),
    };
  };

  it("renders current step pairs", () => {
    const wrapper = mount<{}>(<FarmwareInputs {...fakeProps()} />);
    expect(wrapper.find("label").first().text()).toEqual("Parameters");
    const bulkBtn = wrapper.find("input").first();
    expect(bulkBtn.props().checked).toBeTruthy();
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputToggle = inputs.find("input").first();
    expect(inputToggle.props().checked).toBeTruthy();
    const inputFieldProps = inputs.find("input").last().props();
    expect(inputFieldProps.value).toEqual("1");
    expect(inputFieldProps.disabled).toEqual(false);
  });

  it("renders current step pairs when bot is disconnected", () => {
    const p = fakeProps();
    p.farmwareInstalled = false;
    const wrapper = mount<{}>(<FarmwareInputs {...p} />);
    expect(wrapper.find("label").first().text()).toEqual("Parameters");
    const bulkBtn = wrapper.find("input").first();
    expect(bulkBtn.props().checked).toBeTruthy();
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputToggle = inputs.find("input").first();
    expect(inputToggle.props().checked).toBeTruthy();
    const inputFieldProps = inputs.find("input").last().props();
    expect(inputFieldProps.value).toEqual("1");
    expect(inputFieldProps.disabled).toEqual(false);
  });

  it("shows that current step pair is not needed", () => {
    const p = fakeProps();
    p.defaultConfigs = [];
    const wrapper = mount<{}>(<FarmwareInputs {...p} />);
    expect(wrapper.find("label").first().text()).toEqual("Parameters");
    const bulkBtn = wrapper.find("input").first();
    expect(bulkBtn.props().checked).toBeTruthy();
    const inputs = wrapper.find("fieldset");
    expect(inputs.props().title).toContain("not needed");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputToggle = inputs.find("input").first();
    expect(inputToggle.props().checked).toBeTruthy();
    const inputFieldProps = inputs.find("input").last().props();
    expect(inputFieldProps.value).toEqual("1");
    expect(inputFieldProps.disabled).toEqual(true);
  });

  it("renders config inputs needed by farmware", () => {
    const p = fakeProps();
    delete p.currentStep.body;
    const wrapper = mount<{}>(<FarmwareInputs {...p} />);
    expect(wrapper.find("label").first().text()).toEqual("Parameters");
    const bulkBtn = wrapper.find("input").first();
    expect(bulkBtn.props().checked).toBeFalsy();
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputToggle = inputs.find("input").first();
    expect(inputToggle.props().checked).toBeFalsy();
    expect(inputs.find("input").last().props().type).toEqual("checkbox");
  });

  it("adds an input pair", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    delete p.currentStep.body;
    const wrapper = mount<{}>(<FarmwareInputs {...p} />);
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputToggle = inputs.find("input").first();
    expect(inputToggle.props().checked).toBeFalsy();
    inputToggle.simulate("change");
    expect(p.currentStep.body).toEqual([{
      kind: "pair",
      args: { label: "my_farmware_input_1", value: "1" },
      comment: "Input 1",
    }]);
    // expect(wrapper.find("input").first().props().checked).toBeTruthy();
    // expect(inputToggle.props().checked).toBeTruthy();
  });

  it("adds all input pairs", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    delete p.currentStep.body;
    p.defaultConfigs.push({ name: "input_2", label: "Input 2", value: "2" });
    const wrapper = mount<{}>(<FarmwareInputs {...p} />);
    const bulkBtn = wrapper.find("input").first();
    expect(bulkBtn.props().checked).toBeFalsy();
    bulkBtn.simulate("change");
    expect(p.currentStep.body).toEqual([{
      kind: "pair",
      args: { label: "my_farmware_input_1", value: "1" },
      comment: "Input 1",
    },
    {
      kind: "pair",
      args: { label: "my_farmware_input_2", value: "2" },
      comment: "Input 2",
    }]);
    // expect(bulkBtn.props().checked).toBeTruthy();
  });

  it("adds remaining input pairs", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    p.defaultConfigs.push({ name: "input_2", label: "Input 2", value: "2" });
    const wrapper = mount<{}>(<FarmwareInputs {...p} />);
    const bulkBtn = wrapper.find("input").first();
    expect(bulkBtn.props().checked).toBeFalsy();
    expect(wrapper.find(".fb-checkbox").first().hasClass("partial"))
      .toBeTruthy();
    bulkBtn.simulate("change");
    expect(p.currentStep.body).toEqual([{
      kind: "pair",
      args: { label: "my_farmware_input_1", value: 1 },
      comment: "Input 1",
    },
    {
      kind: "pair",
      args: { label: "my_farmware_input_2", value: "2" },
      comment: "Input 2",
    }]);
    // expect(bulkBtn.props().checked).toBeTruthy();
  });

  it("removes an input pair", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    const wrapper = mount<{}>(<FarmwareInputs {...p} />);
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputToggle = inputs.find("input").first();
    expect(inputToggle.props().checked).toBeTruthy();
    inputToggle.simulate("change");
    expect(p.currentStep.body).toEqual([]);
    // expect(wrapper.find("input").first().props().checked).toBeFalsy();
    // expect(inputToggle.props().checked).toBeFalsy();
  });

  it("removes all input pairs", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    const wrapper = mount<{}>(<FarmwareInputs {...p} />);
    const bulkBtn = wrapper.find("input").first();
    expect(bulkBtn.props().checked).toBeTruthy();
    bulkBtn.simulate("change");
    expect(p.currentStep.body).toEqual(undefined);
    // expect(bulkBtn.props().checked).toBeFalsy();
  });

  it("edits an input pair", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    const wrapper = shallow(<FarmwareInputs {...p} />);
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputField = inputs.find("BlurableInput");
    inputField.simulate("commit", { currentTarget: { value: "2" } });
    expect((p.currentStep.body || [])[0].args.value).toEqual("2");
  });

  it("resets a value to default", () => {
    const p = fakeProps();
    (p.currentStep.body || [])[0].args.value = "2";
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    const wrapper = mount<{}>(<FarmwareInputs {...p} />);
    expect((p.currentStep.body || [])[0].args.value).toEqual("2");
    const resetValueBtn = wrapper.find("i").last();
    expect(resetValueBtn.hasClass("fa-times-circle")).toBeTruthy();
    resetValueBtn.simulate("click");
    expect((p.currentStep.body || [])[0].args.value).toEqual("1");
    // expect(resetValueBtn.hasClass("fa-times-circle")).toBeFalsy();
  });
});
