import * as React from "react";
import { FarmbotOsRow } from "../farmbot_os_row";
import { mount } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { FarmbotOsRowProps } from "../interfaces";
import { fakeState } from "../../../../__test_support__/fake_state";

describe("<FarmbotOsRow/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const fakeProps = (): FarmbotOsRowProps => {
    return {
      bot,
      osReleaseNotes: "",
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      },
      botOnline: false
    };
  };

  it("renders", () => {
    const wrapper = mount(<FarmbotOsRow {...fakeProps()} />);
    ["FarmBot OS", "Version", "Release Notes"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });
});
