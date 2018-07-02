import * as React from "react";
import { mount } from "enzyme";
import { Settings } from "../components";
import { SettingsPropTypes } from "../interfaces";
import { fakeUser } from "../../__test_support__/fake_state/resources";

describe("<Settings/>", function () {
  it("saves user settings", function () {
    const props: SettingsPropTypes = {
      user: fakeUser(),
      onChange: jest.fn(),
      onSave: jest.fn()
    };
    const dom =mount<>(<Settings {...props} />);
    expect(props.onSave).not.toHaveBeenCalled();
    dom.find("button").simulate("click");
    expect(props.onSave).toHaveBeenCalled();
  });
});
