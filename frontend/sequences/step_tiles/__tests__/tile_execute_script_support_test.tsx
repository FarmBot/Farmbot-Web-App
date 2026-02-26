import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  FarmwareInputsProps, FarmwareInputs,
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
      defaultConfigs: [{
        name: "input_1", label: "Input 1", value: 1 as unknown as string,
      }],
      updateStep: jest.fn(),
    };
  };

  it("renders current step pairs", () => {
    const { container } = render(<FarmwareInputs {...fakeProps()} />);
    expect(container.querySelector("label")?.textContent).toEqual("Parameters");
    const bulkBtn = container.querySelector("input") as HTMLInputElement;
    expect(bulkBtn.checked).toBeTruthy();
    const inputs = container.querySelector("fieldset") as HTMLFieldSetElement;
    expect(inputs.querySelector("label")?.textContent).toEqual("Input 1");
    const inputToggle = inputs.querySelector("input") as HTMLInputElement;
    expect(inputToggle.checked).toBeTruthy();
    const fieldInputs = inputs.querySelectorAll("input");
    const inputField = fieldInputs[fieldInputs.length - 1];
    expect(inputField.value).toEqual("1");
    expect(inputField.disabled).toEqual(false);
  });

  it("renders current step pairs when bot is disconnected", () => {
    const p = fakeProps();
    p.farmwareInstalled = false;
    const { container } = render(<FarmwareInputs {...p} />);
    expect(container.querySelector("label")?.textContent).toEqual("Parameters");
    const bulkBtn = container.querySelector("input") as HTMLInputElement;
    expect(bulkBtn.checked).toBeTruthy();
    const inputs = container.querySelector("fieldset") as HTMLFieldSetElement;
    expect(inputs.querySelector("label")?.textContent).toEqual("Input 1");
    const inputToggle = inputs.querySelector("input") as HTMLInputElement;
    expect(inputToggle.checked).toBeTruthy();
    const fieldInputs = inputs.querySelectorAll("input");
    const inputField = fieldInputs[fieldInputs.length - 1];
    expect(inputField.value).toEqual("1");
    expect(inputField.disabled).toEqual(false);
  });

  it("shows that current step pair is not needed", () => {
    const p = fakeProps();
    p.defaultConfigs = [];
    const { container } = render(<FarmwareInputs {...p} />);
    expect(container.querySelector("label")?.textContent).toEqual("Parameters");
    const bulkBtn = container.querySelector("input") as HTMLInputElement;
    expect(bulkBtn.checked).toBeTruthy();
    const inputs = container.querySelector("fieldset") as HTMLFieldSetElement;
    expect(inputs.title).toContain("not needed");
    expect(inputs.querySelector("label")?.textContent).toEqual("Input 1");
    const inputToggle = inputs.querySelector("input") as HTMLInputElement;
    expect(inputToggle.checked).toBeTruthy();
    const fieldInputs = inputs.querySelectorAll("input");
    const inputField = fieldInputs[fieldInputs.length - 1];
    expect(inputField.value).toEqual("1");
  });

  it("renders config inputs needed by farmware", () => {
    const p = fakeProps();
    delete p.currentStep.body;
    const { container } = render(<FarmwareInputs {...p} />);
    expect(container.querySelector("label")?.textContent).toEqual("Parameters");
    const bulkBtn = container.querySelector("input") as HTMLInputElement;
    expect(bulkBtn.checked).toBeFalsy();
    const inputs = container.querySelector("fieldset") as HTMLFieldSetElement;
    expect(inputs.querySelector("label")?.textContent).toEqual("Input 1");
    const inputToggle = inputs.querySelector("input") as HTMLInputElement;
    expect(inputToggle.checked).toBeFalsy();
    const fieldInputs = inputs.querySelectorAll("input");
    const inputField = fieldInputs[fieldInputs.length - 1];
    expect(inputField.type).toEqual("checkbox");
  });

  it("adds an input pair", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    delete p.currentStep.body;
    const { container } = render(<FarmwareInputs {...p} />);
    const inputs = container.querySelector("fieldset") as HTMLFieldSetElement;
    expect(inputs.querySelector("label")?.textContent).toEqual("Input 1");
    const inputToggle = inputs.querySelector("input") as HTMLInputElement;
    expect(inputToggle.checked).toBeFalsy();
    fireEvent.click(inputToggle);
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
    const { container } = render(<FarmwareInputs {...p} />);
    const bulkBtn = container.querySelector("input") as HTMLInputElement;
    expect(bulkBtn.checked).toBeFalsy();
    fireEvent.click(bulkBtn);
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
    const { container } = render(<FarmwareInputs {...p} />);
    const bulkBtn = container.querySelector("input") as HTMLInputElement;
    expect(bulkBtn.checked).toBeFalsy();
    expect(container.querySelector(".fb-checkbox")?.classList
      .contains("partial")).toBeTruthy();
    fireEvent.click(bulkBtn);
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

  it("removes an input pair", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    const { container } = render(<FarmwareInputs {...p} />);
    const inputs = container.querySelector("fieldset") as HTMLFieldSetElement;
    expect(inputs.querySelector("label")?.textContent).toEqual("Input 1");
    const inputToggle = inputs.querySelector("input") as HTMLInputElement;
    expect(inputToggle.checked).toBeTruthy();
    fireEvent.click(inputToggle);
    expect(p.currentStep.body).toEqual([]);
    // expect(wrapper.find("input").first().props().checked).toBeFalsy();
    // expect(inputToggle.props().checked).toBeFalsy();
  });

  it("removes all input pairs", () => {
    const p = fakeProps();
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    const { container } = render(<FarmwareInputs {...p} />);
    const bulkBtn = container.querySelector("input") as HTMLInputElement;
    expect(bulkBtn.checked).toBeTruthy();
    fireEvent.click(bulkBtn);
    expect(p.currentStep.body).toEqual(undefined);
    // expect(bulkBtn.props().checked).toBeFalsy();
  });

  it("edits an input pair", () => {
    const p = fakeProps();
    p.currentStep.body = [{
      kind: "pair",
      args: { label: "my_farmware_input_1", value: 1 },
      comment: "Input 1"
    },
    {
      kind: "pair",
      args: { label: "my_farmware_input_2", value: 0 },
      comment: "Input 2"
    }];
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    const { container } = render(<FarmwareInputs {...p} />);
    const inputField = container
      .querySelector(".farmware-input-group input") as HTMLInputElement;
    expect(inputField).toBeTruthy();
    fireEvent.change(inputField, { target: { value: "2" } });
    fireEvent.blur(inputField, { target: { value: "2" } });
    expect((p.currentStep.body || [])[0].args.value).toEqual("2");
  });

  it("resets a value to default", () => {
    const p = fakeProps();
    (p.currentStep.body || [])[0].args.value = "2";
    p.updateStep = jest.fn(x => { if (x) { x(p.currentStep); } });
    const { container } = render(<FarmwareInputs {...p} />);
    expect((p.currentStep.body || [])[0].args.value).toEqual("2");
    const resetValueBtn =
      container.querySelector(".fa-times-circle") as HTMLElement;
    expect(resetValueBtn).toBeTruthy();
    fireEvent.click(resetValueBtn);
    expect((p.currentStep.body || [])[0].args.value).toEqual("1");
    // expect(resetValueBtn.hasClass("fa-times-circle")).toBeFalsy();
  });
});
