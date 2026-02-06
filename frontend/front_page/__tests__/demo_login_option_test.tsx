let mockResponse: string | Error = "12345";
jest.mock("axios", () => ({
  ...jest.requireActual("axios"),
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
import { render, screen } from "@testing-library/react";
import { shallow } from "enzyme";
import { DemoLoginOption } from "../demo_login_option";

describe("<DemoLoginOption />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = "12345";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.unmock("axios");
    jest.unmock("mqtt");
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
    const wrapper = shallow<DemoLoginOption>(<DemoLoginOption />);
    const connectMqtt = jest.spyOn(wrapper.instance(), "connectMqtt")
      .mockResolvedValue({} as never);
    const connectApi = jest.spyOn(wrapper.instance(), "connectApi")
      .mockResolvedValue(undefined);

    wrapper.instance().requestAccount();
    await Promise.resolve();

    expect(connectMqtt).toHaveBeenCalled();
    expect(connectApi).toHaveBeenCalled();
  });

  it("changes model", () => {
    const wrapper = shallow<DemoLoginOption>(<DemoLoginOption />);
    expect(wrapper.state().productLine).toEqual("genesis_1.8");
    wrapper.find("FBSelect").simulate("change", { value: "express_1.2" });
    expect(wrapper.state().productLine).toEqual("express_1.2");
  });
});
