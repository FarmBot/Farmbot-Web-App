const mockMqttClient = {
  on: jest.fn((ev: string, cb: Function) => ev == "connect" && cb()),
  subscribe: jest.fn(),
};
const mockConnect = jest.fn(() => mockMqttClient);
const mockPost = jest.fn(() => Promise.resolve("OK"));

import mqtt from "mqtt";
import axios from "axios";

import React from "react";
import { act, render } from "@testing-library/react";
import {
  DEMO_LOADING, getTryFarmbotProductLine, TryFarmbot,
} from "../try_farmbot";

let mqttConnectSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;

beforeEach(() => {
  mqttConnectSpy = jest.spyOn(mqtt, "connect")
    .mockImplementation(mockConnect as never);
  axiosPostSpy = jest.spyOn(axios, "post")
    .mockImplementation(mockPost as never);
  jest.clearAllMocks();
});

afterEach(() => {
  location.search = "";
  mqttConnectSpy.mockRestore();
  axiosPostSpy.mockRestore();
});
describe("<TryFarmbot />", () => {
  it("renders OK", () => {
    const tfb = new TryFarmbot({});
    tfb.requestAccount = jest.fn();
    expect(tfb.render()).toEqual(DEMO_LOADING);
    tfb.componentDidMount();
    expect(tfb.requestAccount).toHaveBeenCalled();
  });

  it("renders errors", () => {
    const tfb = new TryFarmbot({});
    tfb.no = jest.fn();
    tfb.state.error = new Error("Testing");
    tfb.render();
    expect(tfb.no).toHaveBeenCalled();
  });

  it("renders", () => {
    console.error = jest.fn();
    const { container } = render(<TryFarmbot />);
    expect(container.textContent?.toLowerCase()).toContain("loading");
  });

  it("gets a product line from the URL", () => {
    location.search = "?productLine=express_xl_1.2";
    expect(getTryFarmbotProductLine()).toEqual("express_xl_1.2");
  });

  it("requests an account for the provided product line", async () => {
    location.search = "?productLine=express_xl_1.2";

    render(<TryFarmbot />);
    await act(async () => { await Promise.resolve(); });

    expect(mockPost).toHaveBeenCalledWith("/api/demo_account", {
      secret: expect.any(String),
      product_line: "express_xl_1.2",
    });
  });
});
