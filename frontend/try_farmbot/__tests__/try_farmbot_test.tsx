const mockMqttClient = {
  on: jest.fn(),
  subscribe: jest.fn(),
};
const mockConnect = jest.fn(() => mockMqttClient);

jest.mock("mqtt", () => ({
  __esModule: true,
  connect: mockConnect,
  default: { connect: mockConnect },
}));

import React from "react";
import { render } from "@testing-library/react";
import { DEMO_LOADING, TryFarmbot } from "../try_farmbot";

beforeEach(() => {
  jest.clearAllMocks();
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
});
