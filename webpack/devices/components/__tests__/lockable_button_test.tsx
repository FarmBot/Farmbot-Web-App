import * as React from "react";
import { LockableButton } from "../lockable_button";
import { mount } from "enzyme";

describe("<LockableButton/>", () => {
  it("does not trigger callback when clicked and disabled", () => {
    const fakeCB = jest.fn();
    const btn =mount<>(<LockableButton disabled={true} onClick={fakeCB} />);
    btn.simulate("click");
    expect(fakeCB).not.toHaveBeenCalled();
  });
  it("does trigger callback when clicked and enabled", () => {
    const fakeCB = jest.fn();
    const btn =mount<>(<LockableButton disabled={false} onClick={fakeCB} />);
    btn.simulate("click");
    expect(fakeCB).toHaveBeenCalled();
  });
});
