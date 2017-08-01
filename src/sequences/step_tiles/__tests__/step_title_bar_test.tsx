import * as React from "react";
import { StepTitleBar } from "../step_title_bar";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Wait } from "farmbot/dist";

describe("<StepTitleBar/>", () => {
  it("title has placeholder, no value", () => {
    const currentStep: Wait = {
      kind: "wait",
      args: {
        milliseconds: 100
      }
    };
    const dispatch = jest.fn();
    let block = mount(<StepTitleBar
      step={currentStep}
      index={0}
      dispatch={dispatch}
      sequence={fakeSequence()} />);
    let inputs = block.find("input");
    expect(inputs.length).toEqual(1);
    let title = inputs.first();
    expect(title.props().value).toEqual("");
    expect(title.props().placeholder).toEqual("Wait");
    title.simulate("blur");
    expect(dispatch).toHaveBeenCalled();
  });
  it("title has value", () => {
    const currentStep: Wait = {
      kind: "wait",
      args: {
        milliseconds: 100
      },
      comment: "new title"
    };
    let block = mount(<StepTitleBar
      step={currentStep}
      index={0}
      dispatch={jest.fn()}
      sequence={fakeSequence()} />);
    let inputs = block.find("input");
    expect(inputs.length).toEqual(1);
    let title = inputs.first();
    expect(title.props().value).toEqual("new title");
  });
});
