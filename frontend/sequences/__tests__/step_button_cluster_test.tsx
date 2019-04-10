import * as React from "react";
import { mount } from "enzyme";
import { StepButtonCluster, StepButtonProps } from "../step_button_cluster";
import { Actions } from "../../constants";

describe("<StepButtonCluster />", () => {
  const commands = ["move to", "move relative", "write pin", "read pin",
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
    const stepButton = wrapper.find("div").last();
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
});
