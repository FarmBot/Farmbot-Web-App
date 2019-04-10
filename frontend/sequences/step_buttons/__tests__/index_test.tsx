import * as React from "react";
import { StepButtonParams } from "../../interfaces";
import { StepButton, stepClick } from "../index";
import { shallow } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";
import { error } from "farmbot-toastr";

function props(): StepButtonParams {
  return {
    current: fakeSequence(),
    step: {
      kind: "wait",
      args: {
        milliseconds: 9,
      },
    },
    dispatch: jest.fn(),
    color: "blue",
    index: 1,
  };
}

describe("<StepButton/>", () => {

  it("clicks it", () => {
    const p = props();
    const el = shallow(<StepButton {...p} />);
    el.find("button").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        update: expect.objectContaining({
          body: [p.step]
        }),
      }),
      type: Actions.OVERWRITE_RESOURCE
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SEQUENCE_STEP_POSITION,
      payload: undefined,
    });
  });
});

describe("stepClick", () => {
  it("pops a toast notification when you  must select a sequence", () => {
    const p = props();
    const clicker = stepClick(p.dispatch, p.step, undefined);
    clicker();
    expect(error).toHaveBeenCalledWith("Select a sequence first");
  });
});
