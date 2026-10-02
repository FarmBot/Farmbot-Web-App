let mockResponse: string | Error = "12345";

const mockMqttClient = {
  on: jest.fn((ev: string, cb: Function) => ev == "connect" && cb()),
  subscribe: jest.fn(),
};

import React from "react";
import { act, render, screen } from "@testing-library/react";
import { DemoLoginOption } from "../demo_login_option";
import axios from "axios";
import mqtt from "mqtt";

describe("<DemoLoginOption />", () => {
  let axiosPostSpy: jest.SpyInstance;
  let mqttConnectSpy: jest.SpyInstance;

  const originalSearch = location.search;

  beforeEach(() => {
    location.search = "";
    jest.clearAllMocks();
    mockResponse = "12345";
    mqttConnectSpy = jest.spyOn(mqtt, "connect")
      .mockImplementation(() => mockMqttClient as never);
    axiosPostSpy = jest.spyOn(axios, "post")
      .mockImplementation(() =>
        typeof mockResponse === "string"
          ? Promise.resolve(mockResponse)
          : Promise.reject(mockResponse));
  });

  afterEach(() => {
    location.search = originalSearch;
    mqttConnectSpy.mockRestore();
    axiosPostSpy.mockRestore();
  });

  it("renders demo controls", () => {
    mockResponse = "ok";
    render(<DemoLoginOption />);
    expect(screen.getByRole("heading", { name: /demo the app/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /demo the app/i }))
      .toBeInTheDocument();
    expect(screen.getByText(/farmbot model/i)).toBeInTheDocument();
  });

  it("requests a demo account on click", async () => {
    mockResponse = "ok";
    const instance = new DemoLoginOption({});
    const connectMqtt = jest.spyOn(instance, "connectMqtt")
      .mockResolvedValue({} as never);
    const connectApi = jest.spyOn(instance, "connectApi")
      .mockResolvedValue(undefined);

    instance.requestAccount();
    await Promise.resolve();

    expect(connectMqtt).toHaveBeenCalled();
    expect(connectApi).toHaveBeenCalled();
  });

  it.each([
    ["", false],
    ["?force_fallback_install=false", false],
    ["?force_fallback_install=true", true],
    ["?force_fallback_install=1", false],
    ["?force_fallback_install=", false],
  ])("sends the bundled-sequence choice for %s", async (query, expected) => {
    location.search = query;
    mockResponse = "ok";
    const ref = React.createRef<DemoLoginOption>();
    render(<DemoLoginOption ref={ref} />);
    await act(async () => { await ref.current?.connectApi(); });
    expect(axiosPostSpy).toHaveBeenCalledWith("/api/demo_account",
      expect.objectContaining({ force_fallback_install: expected }));
  });

  it("changes model", () => {
    const instance = new DemoLoginOption({});
    instance.setState = ((state, callback) => {
      const update = typeof state == "function"
        ? state(instance.state, instance.props)
        : state;
      instance.state = { ...instance.state, ...update };
      callback?.();
    });
    expect(instance.state.productLine).toEqual("genesis_1.8");
    const select = instance["seedDataSelect"]() as React.ReactElement<{
      onChange: (ddi: { value: string }) => void;
    }>;
    select.props.onChange({ value: "express_1.2" });
    expect(instance.state.productLine).toEqual("express_1.2");
  });
});
