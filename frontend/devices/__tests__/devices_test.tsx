jest.mock("../../api/crud", () => ({ save: jest.fn() }));

import * as React from "react";
import { shallow, render } from "enzyme";
import { RawDevices as Devices } from "../devices";
import { Props } from "../interfaces";
import { auth } from "../../__test_support__/fake_state/token";
import { bot } from "../../__test_support__/fake_state/bot";
import {
  fakeDevice, buildResourceIndex, FAKE_RESOURCES,
} from "../../__test_support__/resource_index_builder";
import { FarmbotOsSettings } from "../components/farmbot_os_settings";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { HardwareSettings } from "../components/hardware_settings";

describe("<Devices/>", () => {
  const fakeProps = (): Props => ({
    auth: auth,
    bot: bot,
    deviceAccount: fakeDevice(),
    images: [],
    dispatch: jest.fn(),
    resources: buildResourceIndex(FAKE_RESOURCES).index,
    sourceFbosConfig: () => ({ value: undefined, consistent: true }),
    sourceFwConfig: jest.fn(),
    shouldDisplay: jest.fn(),
    firmwareConfig: undefined,
    env: {},
    saveFarmwareEnv: jest.fn(),
    timeSettings: fakeTimeSettings(),
    alerts: [],
  });

  it("renders relevant panels", () => {
    const el = shallow(<Devices {...fakeProps()} />);
    expect(el.find(FarmbotOsSettings).length).toBe(1);
  });

  it("crashes when logged out", () => {
    const p = fakeProps();
    p.auth = undefined;
    expect(() => render(<Devices {...p} />)).toThrow();
  });

  it("provides correct firmwareHardware value", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: "arduino", consistent: true });
    const wrapper = shallow(<Devices {...p} />);
    expect(wrapper.find(HardwareSettings).props().firmwareHardware)
      .toEqual("arduino");
  });
});
