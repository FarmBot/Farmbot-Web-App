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
});
