let mockResponse: string | Error = "12345";
let mockPost = jest.fn();

const mockMqttClient = {
  on: jest.fn((ev: string, cb: Function) => ev == "connect" && cb()),
  subscribe: jest.fn(),
};
const mockConnect = jest.fn(() => mockMqttClient);

import React from "react";
import axios from "axios";
import mqtt from "mqtt";
import { shallow } from "enzyme";
import { DemoIframe, WAITING_ON_API, EASTER_EGG, MQTT_CHAN } from "../demo_iframe";
import { tourPath } from "../../help/tours";
import { Path } from "../../internal_urls";
import * as messageCards from "../../messages/cards";

describe("<DemoIframe />", () => {
  const originalConsoleError = console.error;
  let seedDataOptionsSpy: jest.SpyInstance;
  let seedDataOptionsDdiSpy: jest.SpyInstance;

  beforeEach(() => {
    seedDataOptionsSpy = jest.spyOn(messageCards, "SEED_DATA_OPTIONS")
      .mockReturnValue([
        { label: "Genesis", value: "genesis_1.8" },
        { label: "Express", value: "express_1.2" },
        { label: "None", value: "none" },
      ]);
    seedDataOptionsDdiSpy = jest.spyOn(messageCards, "SEED_DATA_OPTIONS_DDI")
      .mockReturnValue({
        "genesis_1.8": { label: "Genesis", value: "genesis_1.8" },
        "express_1.2": { label: "Express", value: "express_1.2" },
      });
    mockPost = jest.fn(() =>
      typeof mockResponse === "string"
        ? Promise.resolve(mockResponse)
        : Promise.reject(mockResponse));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).post = mockPost;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mqtt as any).connect = mockConnect;
    mockConnect.mockClear();
    mockMqttClient.on.mockClear();
    mockMqttClient.subscribe.mockClear();
  });

  afterEach(() => {
    seedDataOptionsSpy.mockRestore();
    seedDataOptionsDdiSpy.mockRestore();
    console.error = originalConsoleError;
  });

  it("renders OK", async () => {
    mockResponse = "yep.";
    const el = shallow<DemoIframe>(<DemoIframe />);
    expect(el.text()).toContain("DEMO THE APP");
    await el.instance().connectApi();
    expect(mockPost).toHaveBeenCalled();
    expect(el.state().stage).toContain(WAITING_ON_API);
  });

  it("renders errors", async () => {
    console.error = jest.fn();
    mockResponse = new Error("Nope.");
    const el = shallow<DemoIframe>(<DemoIframe />);
    await el.instance().connectApi();
    expect(mockPost).toHaveBeenCalled();
    expect(el.state().error).toBe(mockResponse);
    expect(console.error).toHaveBeenCalledWith(mockResponse);
  });

  it("changes model", () => {
    const wrapper = shallow<DemoIframe>(<DemoIframe />);
    expect(wrapper.state().productLine).toEqual("genesis_1.8");
    wrapper.find("FBSelect").simulate("change", { value: "express_1.2" });
    expect(wrapper.state().productLine).toEqual("express_1.2");
  });

  it("handles MQTT messages", () => {
    const el = shallow<DemoIframe>(<DemoIframe />);
    el.instance().handleMessage("foo", Buffer.from("bar"));
    expect(location.assign).toHaveBeenCalledWith(
      tourPath(Path.withApp(Path.plants()), "gettingStarted", "intro"));
  });

  it("does something 🤫", async () => {
    mockResponse = "OK!";
    const el = shallow<DemoIframe>(<DemoIframe />);
    const roundSpy = jest.spyOn(Math, "round").mockImplementation(() => 51);
    const request = el.instance().connectApi();
    expect(el.text()).toContain(EASTER_EGG);
    await request;
    roundSpy.mockRestore();
    expect(mockPost).toHaveBeenCalled();
    expect(el.text()).toContain(WAITING_ON_API);
  });

  it("connects to MQTT", async () => {
    const i = new DemoIframe({});
    await i.connectMqtt();
    expect(mockConnect).toHaveBeenCalled();
    const { on, subscribe } = mockMqttClient;
    expect(subscribe).toHaveBeenCalledWith(MQTT_CHAN, i.setError);
    expect(on).toHaveBeenCalledWith("message", i.handleMessage);
    expect(on).toHaveBeenCalledWith("connect", expect.any(Function));
  });
});
