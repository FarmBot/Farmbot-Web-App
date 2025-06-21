jest.mock("../../config_storage/actions", () => ({
  getWebAppConfigValue: jest.fn(() => jest.fn()),
  setWebAppConfigValue: jest.fn(),
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  TimeTravelContent, TimeTravelContentProps,
  TimeTravelTarget, TimeTravelTargetProps,
} from "../time_travel";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { Actions } from "../../constants";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("<TimeTravelTarget />", () => {
  const fakeProps = (): TimeTravelTargetProps => {
    const device = fakeDevice().body;
    device.lat = 1;
    device.lng = 1;
    return {
      isOpen: true,
      click: jest.fn(),
      device,
      timeSettings: fakeTimeSettings(),
      designer: fakeDesignerState(),
      threeDGarden: true,
    };
  };

  it("renders without lat/lng", () => {
    const p = fakeProps();
    p.isOpen = true;
    p.device.lat = undefined;
    p.device.lng = undefined;
    const { container } = render(<TimeTravelTarget {...p} />);
    expect(container).not.toContainHTML("time-travel-button");
  });

  it("renders open", () => {
    const p = fakeProps();
    p.isOpen = true;
    const { container } = render(<TimeTravelTarget {...p} />);
    expect(container).toContainHTML("hover");
  });

  it("renders closed", () => {
    const p = fakeProps();
    p.isOpen = false;
    const { container } = render(<TimeTravelTarget {...p} />);
    expect(container).not.toContainHTML("hover");
  });

  it("renders active", () => {
    const p = fakeProps();
    p.designer.threeDTime = "12:00";
    const { container } = render(<TimeTravelTarget {...p} />);
    expect(container).toContainHTML("active");
  });

  it("renders inactive", () => {
    const p = fakeProps();
    p.designer.threeDTime = undefined;
    const { container } = render(<TimeTravelTarget {...p} />);
    expect(container).not.toContainHTML("active");
  });

  it("renders time", () => {
    const p = fakeProps();
    p.designer.threeDTime = "12:00";
    const { container } = render(<TimeTravelTarget {...p} />);
    expect(container).toContainHTML("12:00");
  });

  it("doesn't render time", () => {
    const p = fakeProps();
    p.designer.threeDTime = undefined;
    const { container } = render(<TimeTravelTarget {...p} />);
    expect(container).toContainHTML(":");
  });
});

describe("<TimeTravelContent />", () => {
  const fakeProps = (): TimeTravelContentProps => ({
    dispatch: jest.fn(),
    device: fakeDevice().body,
    threeDGarden: true,
    designer: fakeDesignerState(),
  });

  it("decreases time offset", () => {
    const p = fakeProps();
    p.device.lat = 1;
    p.device.lng = 1;
    p.designer.threeDTime = "12:00";
    render(<TimeTravelContent {...p} />);
    const topDownViewButton = screen.getByTitle("minus hour");
    fireEvent.click(topDownViewButton);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_TIME,
      payload: "11:00",
    });
  });

  it("increases time offset", () => {
    const p = fakeProps();
    p.device.lat = 1;
    p.device.lng = 1;
    p.designer.threeDTime = "12:00";
    render(<TimeTravelContent {...p} />);
    const topDownViewButton = screen.getByTitle("plus hour");
    fireEvent.click(topDownViewButton);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_TIME,
      payload: "13:00",
    });
  });

  it("resets time offset", () => {
    const p = fakeProps();
    p.device.lat = 1;
    p.device.lng = 1;
    render(<TimeTravelContent {...p} />);
    const topDownViewButton = screen.getByTitle("reset hour");
    fireEvent.click(topDownViewButton);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_TIME,
      payload: undefined,
    });
  });
});
