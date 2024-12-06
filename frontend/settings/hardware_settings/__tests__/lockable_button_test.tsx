import React from "react";
import { LockableButton, LockableButtonProps } from "../lockable_button";
import { shallow } from "enzyme";

describe("<LockableButton />", () => {
  const fakeProps = (): LockableButtonProps => ({
    disabled: false,
    onClick: jest.fn(),
  });

  it("does not trigger callback when clicked and disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const btn = shallow(<LockableButton {...p} />);
    btn.simulate("click");
    expect(p.onClick).not.toHaveBeenCalled();
  });

  it("does trigger callback when clicked and enabled", () => {
    const p = fakeProps();
    p.disabled = false;
    const btn = shallow(<LockableButton {...p} />);
    btn.simulate("click");
    expect(p.onClick).toHaveBeenCalled();
  });
});
