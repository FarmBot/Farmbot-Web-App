let mockPath = "";
jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

import * as React from "react";
import { mount } from "enzyme";
import { StepButtonCluster, StepButtonProps } from "../step_button_cluster";
import { Actions } from "../../constants";
import { push } from "../../history";

describe("<StepButtonCluster />", () => {
  const commands = ["move to", "move relative",
    "control peripheral", "read sensor",
    "wait", "send message", "find home", "if statement", "execute sequence",
    "run farmware", "take photo"];

  const fakeProps = (): StepButtonProps => ({
    dispatch: jest.fn(),
    current: undefined,
    shouldDisplay: () => false,
    stepIndex: undefined,
  });

  it("renders sequence commands", () => {
    const wrapper = mount(<StepButtonCluster {...fakeProps()} />);
    commands.map(command =>
      expect(wrapper.text().toLowerCase()).toContain(command));
    expect(wrapper.text().toLowerCase()).not.toContain("mark as");
  });

  it("renders future commands", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = mount(<StepButtonCluster {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("mark as");
  });

  it("has correct drag data", () => {
    const p = fakeProps();
    const wrapper = mount(<StepButtonCluster {...p} />);
    const steps = wrapper.find(".step-dragger");
    const stepButton = steps.at(steps.length - 2);
    expect(stepButton.text().toLowerCase()).toEqual("take photo");
    stepButton.simulate("dragStart", { dataTransfer: { setData: jest.fn() } });
    expect(p.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.PUT_DATA_XFER,
      payload: expect.objectContaining({
        value: expect.objectContaining({
          kind: "take_photo"
        })
      })
    }));
  });

  it("navigates", () => {
    mockPath = "/app/designer/sequences/commands";
    const p = fakeProps();
    const wrapper = mount(<StepButtonCluster {...p} />);
    wrapper.find("div").last().simulate("click");
    expect(push).toHaveBeenCalledWith("/app/designer/sequences/");
  });

  it("doesn't navigate", () => {
    mockPath = "/app/sequences/1";
    const p = fakeProps();
    const wrapper = mount(<StepButtonCluster {...p} />);
    wrapper.find("div").last().simulate("click");
    expect(push).not.toHaveBeenCalled();
  });
});
