import "../../unmock_i18next";
import * as React from "react";
import { mount } from "enzyme";
import { TitleBar } from "../weed_detector/title";

describe("<TitleBar/>", () => {
  it("Has a progress bar", () => {
    let props = {
      onSave: jest.fn(),
      onTest: jest.fn(),
      onSettingToggle: jest.fn(),
      onDeletionClick: jest.fn(),
      settingsMenuOpen: false,
      title: "Test",
      help: "help text",
      env: {}
    }
    let tb = mount(<TitleBar {...props} />);
    expect(tb.text().toLowerCase()).toContain("clear weeds");
    tb.setProps({ deletionProgress: "10%" });
    expect(tb.text().toLowerCase()).toContain("10%");
    expect(tb.text().toLowerCase()).not.toContain("clear weeds");
  });
});
