import * as React from "react";
import { mount } from "enzyme";
import { StepButtonCluster } from "../step_button_cluster";

describe("<StepButtonCluster />", () => {
  const commands = ["move absolute", "move relative", "write pin", "read pin",
    "wait", "send message", "find home", "if statement", "execute sequence",
    "run farmware", "take photo"];

  it("renders sequence commands", () => {
    const wrapper = mount(<StepButtonCluster
      dispatch={jest.fn()}
      current={undefined} />);
    commands.map(command =>
      expect(wrapper.text().toLowerCase()).toContain(command));
  });

  it("has correct drag data", () => {
    const dispatch = jest.fn();
    const wrapper = mount(<StepButtonCluster
      dispatch={dispatch}
      current={undefined} />);
    const stepButton = wrapper.find("div").last();
    expect(stepButton.text().toLowerCase()).toEqual("take photo");
    stepButton.simulate("dragStart", { dataTransfer: { setData: jest.fn() } });
    const [[{ type, payload }]] = dispatch.mock.calls;
    expect(type).toEqual("PUT_DATA_XFER");
    expect(payload.value.kind).toEqual("take_photo");
  });
});
