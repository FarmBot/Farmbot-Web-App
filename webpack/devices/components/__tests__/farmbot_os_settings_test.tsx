import * as React from "react";
import { FarmbotOsSettings } from "../farmbot_os_settings";
import { mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeState } from "../../../__test_support__/fake_state";
import { fakeResource } from "../../../__test_support__/fake_resource";
import { AuthState } from "../../../auth/interfaces";

describe("<FarmbotOsSettings/>", () => {
  it("renders settings", () => {
    const osSettings = mount(<FarmbotOsSettings
      account={fakeResource("Device", { id: 0, name: "" })}
      dispatch={jest.fn()}
      bot={bot}
      auth={fakeState().auth as AuthState} />);
    expect(osSettings.find("input").length).toBe(1);
    expect(osSettings.find("button").length).toBe(9);
    ["NAME", "TIME ZONE", "LAST SEEN", "FARMBOT OS", "RESTART FARMBOT",
      "SHUTDOWN FARMBOT", "FACTORY RESET", "CAMERA", "FIRMWARE"].map(string =>
        expect(osSettings.text()).toContain(string));
  });
});
