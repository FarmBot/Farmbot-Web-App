import * as React from "react";
import { LockableButton } from "../lockable_button";
import { mount } from "enzyme";

describe("<LockableButton/>", () => {
  it("does not trigger callback when clicked and disabled", () => {
    let fakeCB = jest.fn();
    let btn = mount(<LockableButton disabled={true} onClick={fakeCB} />);
    btn.simulate("click")
    expect(fakeCB.mock.calls.length).toEqual(0);
  });
  it("does trigger callback when clicked and enabled", () => {
    let fakeCB = jest.fn();
    let btn = mount(<LockableButton disabled={false} onClick={fakeCB} />);
    btn.simulate("click")
    expect(fakeCB.mock.calls.length).toEqual(1);
  });
});
