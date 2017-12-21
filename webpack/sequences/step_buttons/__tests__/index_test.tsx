import * as React from "react";
import { StepButtonParams } from "../../interfaces";
import { StepButton } from "../index";
import { shallow } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";

describe("<StepButton/>", () => {
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
      color: "blue"
    };
  }

  it("clicks it", () => {
    const p = props();
    const el = shallow<StepButtonParams>(<StepButton {...p } />);
    el.find("button").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        update: expect.objectContaining({
          body: [p.step]
        }),
      }),
      type: Actions.OVERWRITE_RESOURCE
    });
  });
});
