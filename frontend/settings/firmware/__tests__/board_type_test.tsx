jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

let mockFeatureBoolean = false;
jest.mock("../../../devices/should_display", () => ({
  shouldDisplayFeature: () => mockFeatureBoolean,
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BoardType } from "../board_type";
import { BoardTypeProps } from "../interfaces";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeFbosConfig,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../api/crud";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  fakeTimeSettings,
} from "../../../__test_support__/fake_time_settings";

describe("<BoardType/>", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): BoardTypeProps => ({
    bot,
    alerts: [],
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    botOnline: true,
    timeSettings: fakeTimeSettings(),
    firmwareHardware: undefined,
  });

  it("renders with valid firmwareHardware", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    const { container } = render(<BoardType {...p} />);
    expect(screen.getByText("Farmduino (Genesis v1.3)")).toBeInTheDocument();
    expect(container).not.toContainHTML("dim");
  });

  it("renders with valid firmwareHardware: inconsistent", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    p.sourceFbosConfig = () => ({ value: true, consistent: false });
    const { container } = render(<BoardType {...p} />);
    expect(screen.getByText("Farmduino (Genesis v1.3)")).toBeInTheDocument();
    expect(container).toContainHTML("dim");
  });

  it("calls updateConfig", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    render(<BoardType {...p} />);
    const selection = screen.getByRole("combobox");
    fireEvent.click(selection);
    const item = screen.getByText("Farmduino (Genesis v1.3)");
    fireEvent.click(item);
    expect(edit).toHaveBeenCalledWith(fakeConfig, {
      firmware_hardware: "farmduino"
    });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("displays boards", () => {
    mockFeatureBoolean = false;
    render(<BoardType {...fakeProps()} />);
    const selection = screen.getByRole("combobox");
    fireEvent.click(selection);
    [
      { label: "Farmduino (Genesis v1.7)", value: "farmduino_k17" },
      { label: "Farmduino (Genesis v1.6)", value: "farmduino_k16" },
      { label: "Farmduino (Genesis v1.5)", value: "farmduino_k15" },
      { label: "Farmduino (Genesis v1.4)", value: "farmduino_k14" },
      { label: "Farmduino (Genesis v1.3)", value: "farmduino" },
      { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" },
      { label: "Farmduino (Express v1.1)", value: "express_k11" },
      { label: "Farmduino (Express v1.0)", value: "express_k10" },
      { label: "None", value: "none" },
    ].map(item => {
      expect(screen.getByRole("menuitem", { name: item.label }))
        .toBeInTheDocument();
    });
  });

  it("displays more boards", () => {
    mockFeatureBoolean = true;
    render(<BoardType {...fakeProps()} />);
    const selection = screen.getByRole("combobox");
    fireEvent.click(selection);
    expect(screen.getByText("Farmduino (Express v1.2)")).toBeInTheDocument();
    expect(screen.getByText("Farmduino (Genesis v1.8)")).toBeInTheDocument();
  });
});
