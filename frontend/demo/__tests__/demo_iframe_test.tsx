let mockResponse: string | Error = "12345";
jest.mock("axios", () => ({
  post: jest.fn(() =>
    typeof mockResponse === "string"
      ? Promise.resolve(mockResponse)
      : Promise.reject(mockResponse)),
}));

const mockMqttClient = {
  on: jest.fn((ev: string, cb: Function) => ev == "connect" && cb()),
  subscribe: jest.fn(),
};

jest.mock("mqtt", () => ({ connect: () => mockMqttClient }));

import React from "react";
import axios from "axios";
import { shallow } from "enzyme";
import { DemoIframe, WAITING_ON_API, EASTER_EGG, MQTT_CHAN } from "../demo_iframe";
import { IConnackPacket } from "mqtt";
import { tourPath } from "../../help/tours";
import { Path } from "../../internal_urls";

describe("<DemoIframe />", () => {
  it("renders OK", async () => {
    mockResponse = "yep.";
    const el = shallow<DemoIframe>(<DemoIframe />);
    expect(el.text()).toContain("DEMO THE APP");
    el.instance().connectMqtt = () =>
      Promise.resolve() as unknown as Promise<IConnackPacket>;
    await el.instance().requestAccount();
    await expect(axios.post).toHaveBeenCalled();
    expect(el.state().stage).toContain(WAITING_ON_API);
  });

  it("renders errors", async () => {
    console.error = jest.fn();
    mockResponse = new Error("Nope.");
    const el = shallow<DemoIframe>(<DemoIframe />);
    await el.instance().connectApi();
    expect(axios.post).toHaveBeenCalled();
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
    Math.round = jest.fn(() => 51);
    el.instance().connectApi();
    expect(el.text()).toContain(EASTER_EGG);
    await expect(axios.post).toHaveBeenCalled();
    expect(el.text()).toContain(WAITING_ON_API);
  });

  it("connects to MQTT", async () => {
    const i = new DemoIframe({});
    await i.connectMqtt();
    const { on, subscribe } = mockMqttClient;
    expect(subscribe).toHaveBeenCalledWith(MQTT_CHAN, i.setError);
    expect(on).toHaveBeenCalledWith("message", i.handleMessage);
    expect(on).toHaveBeenCalledWith("connect", expect.any(Function));
  });
});
