import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  ControlsPanel, ControlsPanelProps, RawDesignerControls as DesignerControls,
} from "../../controls/controls";
import { bot } from "../../__test_support__/fake_state/bot";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { DesignerControlsProps } from "../interfaces";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { app } from "../../__test_support__/fake_state/app";
import { Actions } from "../../constants";
import { fakeMenuOpenState } from "../../__test_support__/fake_designer_state";

describe("<DesignerControls />", () => {
  const fakeProps = (): DesignerControlsProps => ({
    dispatch: jest.fn(),
    bot: bot,
    feeds: [],
    peripherals: [],
    sequences: [],
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    firmwareSettings: bot.hardware.mcu_params,
    getConfigValue: jest.fn(),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    env: {},
    firmwareHardware: undefined,
    movementState: fakeMovementState(),
    pinBindings: [],
    logs: [],
  });

  it("renders controls", () => {
    const p = fakeProps();
    render(<DesignerControls {...p} />);
    expect(
      screen.getByText("Controls have moved to the navigation bar."),
    ).toBeInTheDocument();
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.OPEN_POPUP, payload: "controls" });
  });
});

describe("<ControlsPanel />", () => {
  const fakeProps = (): ControlsPanelProps => ({
    dispatch: jest.fn(),
    appState: app,
    bot,
    getConfigValue: jest.fn(),
    sourceFwConfig: jest.fn(),
    env: {},
    firmwareHardware: undefined,
    logs: [],
    feeds: [],
    peripherals: [],
    sequences: [],
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    firmwareSettings: bot.hardware.mcu_params,
  });

  it("renders move", () => {
    const p = fakeProps();
    p.appState.controls.move = true;
    p.appState.controls.peripherals = false;
    p.appState.controls.webcams = false;
    const { container } = render(<ControlsPanel {...p} />);
    expect(container.innerHTML).toContain("move-tab");
    expect(container.innerHTML).not.toContain("peripherals-tab");
    expect(container.innerHTML).not.toContain("webcams-tab");
  });

  it("renders peripherals", () => {
    const p = fakeProps();
    p.appState.controls.move = false;
    p.appState.controls.peripherals = true;
    p.appState.controls.webcams = false;
    const { container } = render(<ControlsPanel {...p} />);
    expect(container.innerHTML).not.toContain("move-tab");
    expect(container.innerHTML).toContain("peripherals-tab");
    expect(container.innerHTML).not.toContain("webcams-tab");
  });

  it("renders webcams", () => {
    const p = fakeProps();
    p.appState.controls.move = false;
    p.appState.controls.peripherals = false;
    p.appState.controls.webcams = true;
    const { container } = render(<ControlsPanel {...p} />);
    expect(container.innerHTML).not.toContain("move-tab");
    expect(container.innerHTML).not.toContain("peripherals-tab");
    expect(container.innerHTML).toContain("webcams-tab");
  });

  it("sets state", () => {
    const p = fakeProps();
    render(<ControlsPanel {...p} />);
    fireEvent.click(screen.getByText("move"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CONTROLS_PANEL_OPTION, payload: "move",
    });
  });
});
