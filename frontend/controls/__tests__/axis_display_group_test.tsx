let mockDev = false;
import * as devSupport from "../../settings/dev/dev_support";

import { render, screen } from "@testing-library/react";
import { AxisDisplayGroup } from "../axis_display_group";
import { AxisDisplayGroupProps } from "../interfaces";

let futureFeaturesEnabledSpy: jest.SpyInstance;

beforeEach(() => {
  futureFeaturesEnabledSpy =
    jest.spyOn(devSupport.DevSettings, "futureFeaturesEnabled")
      .mockImplementation(() => mockDev);
});

afterEach(() => {
  futureFeaturesEnabledSpy.mockRestore();
});

describe("<AxisDisplayGroup />", () => {
  const fakeProps = (): AxisDisplayGroupProps => ({
    position: { x: undefined, y: undefined, z: undefined },
    firmwareSettings: {
      encoder_enabled_x: 1,
      encoder_enabled_y: 1,
      encoder_enabled_z: 1,
    },
    label: "Heyoo",
  });

  it("has 3 inputs and a label", () => {
    const { container } = render(AxisDisplayGroup(fakeProps()));
    expect(container.querySelectorAll("input").length).toEqual(3);
    expect(container.querySelectorAll("label").length).toEqual(1);
  });

  it("renders '' for falsy values", () => {
    const { container } = render(AxisDisplayGroup(fakeProps()));
    const inputs = container.querySelectorAll("input");
    expect(inputs[0]?.value).toBe("---");
    expect(inputs[1]?.value).toBe("---");
    expect(inputs[2]?.value).toBe("---");
    expect(screen.getByText("Heyoo")).toBeInTheDocument();
  });

  it("renders real values for ... real values", () => {
    const p = fakeProps();
    p.position = { x: 1, y: 2, z: 3 };
    const { container } = render(AxisDisplayGroup(p));
    const inputs = container.querySelectorAll("input");
    expect(inputs[0]?.value).toBe("1");
    expect(inputs[1]?.value).toBe("2");
    expect(inputs[2]?.value).toBe("3");
    expect(screen.getByText("Heyoo")).toBeInTheDocument();
  });

  it("renders missed step indicator", () => {
    const p = fakeProps();
    p.missedSteps = { x: 0, y: 2, z: 3 };
    const { container } = render(AxisDisplayGroup(p));
    expect(container.querySelectorAll(".missed-step-indicator").length)
      .toEqual(3);
  });

  it("doesn't render missed step indicator when undefined", () => {
    const p = fakeProps();
    p.missedSteps = undefined;
    const { container } = render(AxisDisplayGroup(p));
    expect(container.querySelectorAll(".missed-step-indicator").length)
      .toEqual(0);
  });

  it("doesn't render missed step indicator when invalid", () => {
    const p = fakeProps();
    p.missedSteps = { x: -1, y: -1, z: -1 };
    const { container } = render(AxisDisplayGroup(p));
    expect(container.querySelectorAll(".missed-step-indicator").length)
      .toEqual(0);
  });

  it("doesn't render missed step indicator when detection not enabled", () => {
    const p = fakeProps();
    p.firmwareSettings = undefined;
    p.missedSteps = { x: 1, y: 2, z: 3 };
    const { container } = render(AxisDisplayGroup(p));
    expect(container.querySelectorAll(".missed-step-indicator").length)
      .toEqual(0);
  });

  it("renders missed step indicator when idle", () => {
    const p = fakeProps();
    p.missedSteps = { x: 1, y: 2, z: 3 };
    p.axisStates = { x: "idle", y: undefined, z: "stop" };
    const { container } = render(AxisDisplayGroup(p));
    const instants = container.querySelectorAll(".missed-step-indicator .instant");
    expect(instants.length).toEqual(3);
    expect(instants[0]?.getAttribute("style")).toContain("width: 0%");
    expect(instants[1]?.getAttribute("style")).toContain("width: 2%");
    expect(instants[2]?.getAttribute("style")).toContain("width: 3%");
  });

  it("renders axis state", () => {
    mockDev = true;
    const p = fakeProps();
    p.busy = true;
    p.axisStates = { x: "idle", y: "idle", z: "idle" };
    render(AxisDisplayGroup(p));
    expect(screen.getAllByText("idle").length).toBeGreaterThan(0);
  });

  it("doesn't render axis state", () => {
    mockDev = false;
    const p = fakeProps();
    p.axisStates = { x: undefined, y: undefined, z: undefined };
    render(AxisDisplayGroup(p));
    expect(screen.queryByText("idle")).not.toBeInTheDocument();
  });

  it("highlights", () => {
    const p = fakeProps();
    p.highlightAxis = "x";
    const { container } = render(AxisDisplayGroup(p));
    expect(container.querySelector("input")?.getAttribute("style"))
      .toContain("border");
  });
});
