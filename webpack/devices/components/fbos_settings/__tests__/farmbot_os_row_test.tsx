import * as React from "react";
import { FarmbotOsRow } from "../farmbot_os_row";
import { mount } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { FarmbotOsRowProps } from "../interfaces";
import { fakeState } from "../../../../__test_support__/fake_state";

describe("<FarmbotOsRow/>", () => {
  const fakeProps = (): FarmbotOsRowProps => {
    return {
      bot,
      osReleaseNotesHeading: "",
      osReleaseNotes: "",
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      },
      shouldDisplay: () => false,
      botOnline: false
    };
  };

  it("renders", () => {
    const wrapper = mount(<FarmbotOsRow {...fakeProps()} />);
    ["FarmBot OS", "Version", "Release Notes"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });

  it("shows beta version string", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.controller_version = "1.0.0";
    p.bot.hardware.informational_settings.currently_on_beta = true;
    const wrapper = mount(<FarmbotOsRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("1.0.0-beta");
  });
});
