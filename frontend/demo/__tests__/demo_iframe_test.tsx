let mockResponse: string | Error = "12345";

jest.mock("axios", () => {
  return {
    post: jest.fn(() => {
      if (typeof mockResponse === "string") {
        return Promise.resolve(mockResponse);
      } else {
        return Promise.reject(mockResponse);
      }
    })
  };
});

const mockMqttClient = {
  on: jest.fn((ev: string, cb: Function) => {
    (ev == "connect") && cb();
  }),
  subscribe: jest.fn(),
};

jest
  .mock("mqtt", () => ({
    connect: () => mockMqttClient
  }));

import * as React from "react";
import { shallow } from "enzyme";
import { DemoIframe, WAITING_ON_API, EASTER_EGG, MQTT_CHAN } from "../demo_iframe";
import Axios from "axios";

describe("<DemoIframe/>", () => {
  function stubOutMqtt(instance: DemoIframe) {
    const mockMqtt: unknown =
      jest.fn((): Promise<void> => Promise.resolve());
    instance.connectMqtt =
      mockMqtt as typeof instance.connectMqtt;
    return instance;
  }

  it("renders OK", async (done) => {
    mockResponse = "yep.";
    const el = shallow<DemoIframe>(<DemoIframe />);
    expect(el.text()).toContain("DEMO THE APP");

    await stubOutMqtt(el.instance()).requestAccount();

    expect(Axios.post).toHaveBeenCalled();
    el.update();
    expect(el.state().stage).toContain(WAITING_ON_API);
    done();
  });

  it("renders errors", async () => {
    mockResponse = new Error("Nope.");
    const el = shallow<DemoIframe>(<DemoIframe />);

    await el.instance().connectApi();

    expect(Axios.post).toHaveBeenCalled();
    el.render();
    expect(el.state().error).toBe(mockResponse);
  });

  it("handles MQTT messages", () => {
    location.assign = jest.fn();
    const el = shallow<DemoIframe>(<DemoIframe />);
    el.instance().handleMessage("foo", Buffer.from("bar"));
    expect(location.assign).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("does something 🤫", async () => {
    mockResponse = "OK!";
    const el = shallow<DemoIframe>(<DemoIframe />);
    Math.round = jest.fn(() => 51);
    el.instance().connectApi();
    expect(Axios.post).toHaveBeenCalled();
    el.render();
    expect(el.text()).toContain(EASTER_EGG);
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
