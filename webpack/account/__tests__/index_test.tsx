jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("farmbot-toastr/dist", () => ({ success: jest.fn() }));

import * as React from "react";
import { fakeState } from "../../__test_support__/fake_state";
import { mapStateToProps } from "../state_to_props";
import { mount } from "enzyme";
import { Account } from "../index";
import { edit } from "../../api/crud";

describe("<Account />", () => {
  it("handles the onChange event - bad input", () => {
    const props = mapStateToProps(fakeState());
    props.dispatch = jest.fn();

    const el = mount<Account>(<Account {...props} />);
    expect(() => {
      (el.instance()).onChange({
        currentTarget: {
          name: "foo",
          value: "bar"
        }
      } as any);
    }).toThrow();
    (el.instance() as Account).onChange({
      currentTarget: {
        name: "email",
        value: "foo@bar.com"
      }
    } as any);
    expect(props.dispatch).toHaveBeenCalledTimes(1);
    const expected = edit(props.user, { email: "foo@bar.com" });
    expect(props.dispatch).toHaveBeenCalledWith(expected);
  });

  it("triggers the onSave() event", () => {
    const props = mapStateToProps(fakeState());
    props.dispatch = jest.fn(() => Promise.resolve({}));
    const el = mount<Account>(<Account {...props} />);

    (el.instance()).onSave();
    expect(props.dispatch).toHaveBeenCalledTimes(1);
  });
});
