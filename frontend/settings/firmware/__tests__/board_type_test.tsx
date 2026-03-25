let mockFeatureBoolean = false;

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BoardType } from "../board_type";
import { BoardTypeProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  fakeTimeSettings,
} from "../../../__test_support__/fake_time_settings";
import * as shouldDisplay from "../../../devices/should_display";
import * as deviceActions from "../../../devices/actions";
import * as ui from "../../../ui";
import { FBSelectProps } from "../../../ui";

let shouldDisplayFeatureSpy: jest.SpyInstance;
let updateConfigSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  shouldDisplayFeatureSpy = jest.spyOn(shouldDisplay, "shouldDisplayFeature")
    .mockImplementation(() => mockFeatureBoolean);
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn() as never);
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((props: FBSelectProps) =>
      <div>
        <span data-testid="selected-item">
          {props.selectedItem ? JSON.stringify(props.selectedItem) : ""}
        </span>
        <span data-testid="select-list">{JSON.stringify(props.list)}</span>
        <span data-testid="extra-class">{props.extraClass || ""}</span>
        <button onClick={() => props.onChange({
          label: "Farmduino (Genesis v1.3)",
          value: "farmduino",
        })}>
          select-farmduino
        </button>
      </div>) as never);
});

afterEach(() => {
  mockFeatureBoolean = false;
  shouldDisplayFeatureSpy.mockRestore();
  updateConfigSpy.mockRestore();
  fbSelectSpy.mockRestore();
});

describe("<BoardType/>", () => {
  const fakeProps = (): BoardTypeProps => ({
    bot,
    alerts: [],
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    botOnline: true,
    timeSettings: fakeTimeSettings(),
    firmwareHardware: undefined,
  });

  it("renders with valid firmwareHardware", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    render(<BoardType {...p} />);
    expect(screen.getByTestId("selected-item").textContent).toEqual(JSON.stringify({
      label: "Farmduino (Genesis v1.3)",
      value: "farmduino",
    }));
    expect(screen.getByTestId("extra-class").textContent).not.toContain("dim");
  });

  it("renders with valid firmwareHardware: inconsistent", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    p.sourceFbosConfig = () => ({ value: true, consistent: false });
    render(<BoardType {...p} />);
    expect(screen.getByTestId("selected-item").textContent).toEqual(JSON.stringify({
      label: "Farmduino (Genesis v1.3)",
      value: "farmduino",
    }));
    expect(screen.getByTestId("extra-class").textContent).toContain("dim");
  });

  it("calls updateConfig", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    render(<BoardType {...p} />);
    fireEvent.click(screen.getByText("select-farmduino"));
    expect(updateConfigSpy).toHaveBeenCalledWith({
      firmware_hardware: "farmduino"
    });
    expect(p.dispatch).toHaveBeenCalledWith(updateConfigSpy.mock.results[0].value);
  });

  it("displays boards", () => {
    mockFeatureBoolean = false;
    render(<BoardType {...fakeProps()} />);
    const list = JSON.parse(screen.getByTestId("select-list").textContent || "[]") as
      Array<{ label: string, value: string }>;
    const labels = list.map(item => item.label);
    [
      "Farmduino (Genesis v1.7)",
      "Farmduino (Genesis v1.6)",
      "Farmduino (Genesis v1.5)",
      "Farmduino (Genesis v1.4)",
      "Farmduino (Genesis v1.3)",
      "Arduino/RAMPS (Genesis v1.2)",
      "Farmduino (Express v1.1)",
      "Farmduino (Express v1.0)",
      "None",
    ].map(label => {
      expect(labels).toContain(label);
    });
  });

  it("displays more boards", () => {
    mockFeatureBoolean = true;
    render(<BoardType {...fakeProps()} />);
    const list = JSON.parse(screen.getByTestId("select-list").textContent || "[]") as
      Array<{ label: string, value: string }>;
    const labels = list.map(item => item.label);
    expect(labels).toContain("Farmduino (Express v1.2)");
    expect(labels).toContain("Farmduino (Genesis v1.8)");
  });
});
