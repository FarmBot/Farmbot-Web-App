jest.mock("react-redux", () => ({
  connect: jest.fn()
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
    shouldDisplay: jest.fn()
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
