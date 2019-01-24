jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../actions", () => ({
  resetConnectionInfo: jest.fn()
}));

import * as React from "react";
import { shallow, render } from "enzyme";
import { Devices } from "../devices";
import { Props } from "../interfaces";
import { auth } from "../../__test_support__/fake_state/token";
import { bot } from "../../__test_support__/fake_state/bot";
import {
  fakeDevice, buildResourceIndex, FAKE_RESOURCES
} from "../../__test_support__/resource_index_builder";
import { FarmbotOsSettings } from "../components/farmbot_os_settings";
import { resetConnectionInfo } from "../actions";

describe("<Devices/>", () => {
  const p = (): Props => ({
    userToApi: undefined,
    userToMqtt: undefined,
    botToMqtt: undefined,
    auth: auth,
    bot: bot,
    deviceAccount: fakeDevice(),
    images: [],
    dispatch: jest.fn(),
    resources: buildResourceIndex(FAKE_RESOURCES).index,
    sourceFbosConfig: jest.fn(),
    sourceFwConfig: jest.fn(),
    shouldDisplay: jest.fn(),
    firmwareConfig: undefined,
    isValidFbosConfig: false,
    env: {},
    saveFarmwareEnv: jest.fn(),
  });

  it("resets connection info", () => {
    const el = shallow<Devices>(<Devices {...p()} />);
    const devices: Devices = el.instance();
    jest.resetAllMocks();
    expect(devices.props.dispatch).not.toHaveBeenCalled();
    devices.refresh();
    expect(devices.props.dispatch).toHaveBeenCalled();
    expect(resetConnectionInfo).toHaveBeenCalled();
  });
  it("renders relevant panels", () => {
    const el = shallow(<Devices {...p()} />);
    expect(el.find(FarmbotOsSettings).length).toBe(1);
  });

  it("Crashes when logged out", () => {
    const props = p();
    props.auth = undefined;
    expect(() => render(<Devices {...props} />)).toThrow();
  });
});
