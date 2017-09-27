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
      account={fakeResource("device", { id: 0, name: "" })}
      dispatch={jest.fn()}
      bot={bot}
      auth={fakeState().auth as AuthState} />);
    expect(osSettings.find("input").length).toBe(1);
    expect(osSettings.find("button").length).toBe(8);
    expect(osSettings.text()).toContain("NAME");
    expect(osSettings.text()).toContain("TIME ZONE");
    expect(osSettings.text()).toContain("LAST SEEN");
    expect(osSettings.text()).toContain("FARMBOT OS");
    expect(osSettings.text()).toContain("RESTART FARMBOT");
    expect(osSettings.text()).toContain("SHUTDOWN FARMBOT");
    expect(osSettings.text()).toContain("FACTORY RESET");
    expect(osSettings.text()).toContain("CAMERA");
  });
});
