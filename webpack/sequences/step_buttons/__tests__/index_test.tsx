import * as React from "react";
import { StepButtonParams } from "../../interfaces";
import { StepButton } from "../index";
import { shallow } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { ReduxAction } from "../../../redux/interfaces";
import { EditResourceParams } from "../../../api/interfaces";

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
    let p = props();
    let el = shallow<StepButtonParams>(<StepButton {...p } />);
    el.find("button").simulate("click");
    let action: ReduxAction<EditResourceParams>;
    action = (p.dispatch as jest.Mock<{}>).mock.calls[0][0];
    expect(action).toBeTruthy();
    expect(action.type).toBe("OVERWRITE_RESOURCE");
    if (p.current && p.current.body.body) {
      expect((action.payload.update as any).body[0]).toMatchObject(p.step);
    } else {
      fail("No");
    }
  });
});
