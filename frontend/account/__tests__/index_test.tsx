jest.mock("../labs/labs_features", () => ({ LabsFeatures: () => <div /> }));

import * as React from "react";
import { fakeState } from "../../__test_support__/fake_state";
import { mapStateToProps } from "../state_to_props";
import { shallow, mount } from "enzyme";
import { RawAccount as Account } from "../index";
import { edit } from "../../api/crud";

describe("<Account />", () => {
  it("handles the onChange event - bad input", () => {
    const props = mapStateToProps(fakeState());
    props.dispatch = jest.fn();

    const el = shallow(<Account {...props} />);
    expect(() =>
      el.find("Settings").simulate("change", {
        currentTarget: {
          name: "foo",
          value: "bar"
        }
      })).toThrow();
    el.find("Settings").simulate("change", {
      currentTarget: {
        name: "email",
        value: "foo@bar.com"
      }
    });
    expect(props.dispatch).toHaveBeenCalledTimes(1);
    const expected = edit(props.user, { email: "foo@bar.com" });
    expect(props.dispatch).toHaveBeenCalledWith(expected);
  });

  it("triggers the onSave() event", () => {
    const props = mapStateToProps(fakeState());
    props.dispatch = jest.fn(() => Promise.resolve({}));
    const el = shallow(<Account {...props} />);

    el.find("Settings").simulate("save");
    expect(props.dispatch).toHaveBeenCalledTimes(1);
  });

  it("doesn't show dev widget", () => {
    const props = mapStateToProps(fakeState());
    props.getConfigValue = () => false;
    const wrapper = mount(<Account {...props} />);
    expect(wrapper.text()).not.toContain("Dev options");
  });

  it("shows dev widget", () => {
    const props = mapStateToProps(fakeState());
    props.getConfigValue = () => true;
    const wrapper = mount(<Account {...props} />);
    expect(wrapper.text()).toContain("Dev options");
  });
});
