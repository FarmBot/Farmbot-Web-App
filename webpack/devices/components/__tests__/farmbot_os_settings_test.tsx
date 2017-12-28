import * as React from "react";
import { FarmbotOsSettings } from "../farmbot_os_settings";
import { mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeState } from "../../../__test_support__/fake_state";
import { fakeResource } from "../../../__test_support__/fake_resource";
import { AuthState } from "../../../auth/interfaces";
import { FbosDetails } from "../fbos_settings/auto_update_row";

describe("<FarmbotOsSettings/>", () => {
  it("renders settings", () => {
    const osSettings = mount(<FarmbotOsSettings
      account={fakeResource("Device", { id: 0, name: "", tz_offset_hrs: 0 })}
      dispatch={jest.fn()}
      bot={bot}
      auth={fakeState().auth as AuthState} />);
    expect(osSettings.find("input").length).toBe(1);
    expect(osSettings.find("button").length).toBe(6);
    ["NAME", "TIME ZONE", "LAST SEEN", "FARMBOT OS", "CAMERA", "FIRMWARE"]
      .map(string => expect(osSettings.text()).toContain(string));
  });
});

describe("<FbosDetails />", () => {
  it("renders", () => {
    const wrapper = mount(<FbosDetails {...bot} />);
    ["Environment: ---",
      "Commit: ---",
      "Target: ---",
      "Node name: ---",
      "Firmware: "].map(string =>
        expect(wrapper.text()).toContain(string));
  });
});
