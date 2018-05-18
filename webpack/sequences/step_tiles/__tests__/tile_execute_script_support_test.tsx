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
    const wrapper = mount(<FarmwareInputs {...fakeProps()} />);
    expect(wrapper.find("label").first().text()).toEqual("Inputs");
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputFieldProps = inputs.find("input").props();
    expect(inputFieldProps.value).toEqual("1");
    expect(inputFieldProps.disabled).toEqual(false);
    const button = inputs.find("button");
    expect(button.text()).toEqual("");
    expect(button.hasClass("red")).toBeTruthy();
  });

  it("renders current step pairs when bot is disconnected", () => {
    const p = fakeProps();
    p.farmwareInstalled = false;
    const wrapper = mount(<FarmwareInputs {...p} />);
    expect(wrapper.find("label").first().text()).toEqual("Inputs");
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputFieldProps = inputs.find("input").props();
    expect(inputFieldProps.value).toEqual("1");
    expect(inputFieldProps.disabled).toEqual(false);
    const button = inputs.find("button");
    expect(button.text()).toEqual("");
    expect(button.hasClass("red")).toBeTruthy();
  });

  it("shows that current step pair is not needed", () => {
    const p = fakeProps();
    p.defaultConfigs = [];
    const wrapper = mount(<FarmwareInputs {...p} />);
    expect(wrapper.find("label").first().text()).toEqual("Inputs");
    const inputs = wrapper.find("fieldset");
    expect(inputs.props().title).toContain("not needed");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputFieldProps = inputs.find("input").props();
    expect(inputFieldProps.value).toEqual("1");
    expect(inputFieldProps.disabled).toEqual(true);
    const button = inputs.find("button");
    expect(button.text()).toEqual("");
    expect(button.hasClass("red")).toBeTruthy();
  });

  it("renders config inputs needed by farmware", () => {
    const p = fakeProps();
    p.currentStep.body = [];
    const wrapper = mount(<FarmwareInputs {...p} />);
    expect(wrapper.find("label").first().text()).toEqual("Inputs");
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const inputFieldProps = inputs.find("input").props();
    expect(inputFieldProps.value).toEqual("1");
    expect(inputFieldProps.disabled).toEqual(false);
    const button = inputs.find("button");
    expect(button.text()).toEqual("*");
    expect(button.hasClass("green")).toBeTruthy();
  });

  it("adds an input pair", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    p.currentStep.body = [];
    const wrapper = mount(<FarmwareInputs {...p} />);
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const button = inputs.find("button");
    expect(button.text()).toEqual("*");
    expect(button.hasClass("green")).toBeTruthy();
    button.simulate("click");
    expect(p.currentStep.body).toEqual([{
      kind: "pair",
      args: { label: "my_farmware_input_1", value: "1" },
      comment: "Input 1",
    }]);
    // expect(inputs.find("button").text()).toEqual("");
    // expect(inputs.find("button").hasClass("red")).toBeTruthy();
  });

  it("removes an input pair", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    const wrapper = mount(<FarmwareInputs {...p} />);
    const inputs = wrapper.find("fieldset");
    expect(inputs.find("label").text()).toEqual("Input 1");
    const button = inputs.find("button");
    expect(inputs.find("button").text()).toEqual("");
    expect(inputs.find("button").hasClass("red")).toBeTruthy();
    button.simulate("click");
    expect(p.currentStep.body).toEqual([]);
    // expect(button.text()).toEqual("*");
    // expect(button.hasClass("green")).toBeTruthy();
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
});
