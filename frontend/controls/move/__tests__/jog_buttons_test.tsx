import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  JogButtons, PowerAndResetMenu, PowerAndResetMenuProps,
} from "../jog_buttons";
import * as deviceActions from "../../../devices/actions";
import { JogMovementControlsProps } from "../interfaces";
import * as factoryResetRowModule from
  "../../../settings/fbos_settings/factory_reset_row";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeWebAppConfig } from "../../../__test_support__/fake_state/resources";
import { fakeMovementState } from "../../../__test_support__/fake_bot_data";
import { cloneDeep } from "lodash";

let moveRelativeSpy: jest.SpyInstance;
let restartFirmwareSpy: jest.SpyInstance;
let factoryResetRowsSpy: jest.SpyInstance;

beforeEach(() => {
  factoryResetRowsSpy = jest.spyOn(factoryResetRowModule, "FactoryResetRows")
    .mockImplementation(() => <div />);
});

afterEach(() => {
  factoryResetRowsSpy.mockRestore();
});
describe("<JogButtons />", () => {
  const mockConfig = fakeWebAppConfig();
  const buttonByTitle = (container: HTMLElement, title: string) =>
    container.querySelector(`button[title="${title}"]`) as HTMLButtonElement;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig.body.xy_swap = false;
    moveRelativeSpy =
      jest.spyOn(deviceActions, "moveRelative").mockImplementation(jest.fn());
  });

  afterEach(() => {
    moveRelativeSpy.mockRestore();
  });

  const jogButtonProps = (): JogMovementControlsProps => ({
    stepSize: 100,
    botPosition: { x: undefined, y: undefined, z: undefined },
    getConfigValue: key => mockConfig.body[key],
    arduinoBusy: false,
    botOnline: true,
    firmwareSettings: cloneDeep(bot.hardware.mcu_params),
    env: {},
    locked: false,
    dispatch: jest.fn(),
    movementState: fakeMovementState(),
    imageJobs: [],
    logs: [],
  });

  it("is disabled", () => {
    const p = jogButtonProps();
    p.arduinoBusy = true;
    const { container } = render(<JogButtons {...p} />);
    fireEvent.click(buttonByTitle(container, "move x axis (100)"));
    expect(deviceActions.moveRelative).not.toHaveBeenCalled();
  });

  it("has unswapped xy jog buttons", () => {
    const { container } = render(<JogButtons {...jogButtonProps()} />);
    const button = buttonByTitle(container, "move x axis (100)");
    expect(button.title).toBe("move x axis (100)");
    fireEvent.click(button);
    expect(deviceActions.moveRelative)
      .toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });
  });

  it("has swapped xy jog buttons", () => {
    mockConfig.body.xy_swap = true;
    const p = jogButtonProps();
    (p.stepSize as number | undefined) = undefined;
    const { container } = render(<JogButtons {...p} />);
    const button = buttonByTitle(container, "move y axis (100)");
    expect(button.title).toBe("move y axis (100)");
    fireEvent.click(button);
    expect(deviceActions.moveRelative)
      .toHaveBeenCalledWith({ x: 0, y: 100, z: 0 });
  });

  it("highlights x axis jog button", () => {
    mockConfig.body.xy_swap = false;
    const p = jogButtonProps();
    p.highlightAxis = "x";
    const { container } = render(<JogButtons {...p} />);
    const cells = container.querySelectorAll("td");
    expect(cells[13]?.getAttribute("style")).toContain("border");
  });

  it("highlights y axis jog button", () => {
    mockConfig.body.xy_swap = false;
    const p = jogButtonProps();
    p.highlightAxis = "y";
    const { container } = render(<JogButtons {...p} />);
    const cells = container.querySelectorAll("td");
    expect(cells[4]?.getAttribute("style")).toContain("border");
  });

  it("highlights z axis jog button", () => {
    const p = jogButtonProps();
    p.highlightAxis = "z";
    const { container } = render(<JogButtons {...p} />);
    const cells = container.querySelectorAll("td");
    expect(cells[15]?.getAttribute("style")).toContain("border");
  });
});

describe("<PowerAndResetMenu />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restartFirmwareSpy =
      jest.spyOn(deviceActions, "restartFirmware").mockImplementation(jest.fn());
  });

  afterEach(() => {
    restartFirmwareSpy.mockRestore();
  });

  const fakeProps = (): PowerAndResetMenuProps => ({
    botOnline: true,
    showAdvanced: true,
    dispatch: jest.fn(),
  });

  it("restarts firmware", () => {
    render(<PowerAndResetMenu {...fakeProps()} />);
    fireEvent.click(screen.getAllByTitle("RESTART")[0]);
    expect(deviceActions.restartFirmware).toHaveBeenCalled();
  });
});
