import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  RpiModel, RpiModelProps, StatusDetails, StatusDetailsProps,
} from "../rpi_model";
import { edit, save } from "../../../api/crud";
import * as crud from "../../../api/crud";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FirmwareHardware } from "farmbot";
import * as ui from "../../../ui";
import { FBSelectProps } from "../../../ui";

type TestCase = [string, string, FirmwareHardware, string];

const TEST_CASES: TestCase[] = [
  ["3", "rpi3", "arduino", "pi 3"],
  ["4", "rpi4", "farmduino_k16", "pi 4"],
  ["4", "rpi4", "farmduino_k17", "pi 4"],
  ["4", "rpi4", "farmduino_k18", "pi 4"],
  ["01", "rpi", "express_k10", "zero w"],
  ["02", "rpi3", "express_k11", "zero 2 w"],
  ["02", "rpi3", "express_k12", "zero 2 w"],
];

let fbSelectSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((props: FBSelectProps) =>
      <button onClick={() => props.onChange({ label: "", value: "3" })}>
        select-rpi3
      </button>) as never);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
});
describe("<RpiModel />", () => {
  const fakeProps = (): RpiModelProps => ({
    device: fakeDevice(),
    firmwareHardware: "arduino",
    showAdvanced: true,
    dispatch: jest.fn(),
    bot,
  });

  it("changes rpi model", () => {
    const p = fakeProps();
    render(<RpiModel {...p} />);
    fireEvent.click(screen.getByText("select-rpi3"));
    expect(edit).toHaveBeenCalledWith(p.device, { rpi: "3" });
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("shows error", () => {
    const p = fakeProps();
    p.device.body.rpi = "3";
    p.bot.hardware.informational_settings.target = "rpi";
    const { container } = render(<RpiModel {...p} />);
    expect(container.innerHTML).toContain("fa-times-circle");
  });

  it("shows error: no selection", () => {
    const p = fakeProps();
    p.device.body.rpi = undefined;
    p.bot.hardware.informational_settings.target = "rpi";
    const { container } = render(<RpiModel {...p} />);
    expect(container.innerHTML).toContain("fa-times-circle");
  });

  it.each(TEST_CASES)("doesn't show error: %s %s",
    (selection, target, _firmwareHardware, _expected) => {
      const p = fakeProps();
      p.device.body.rpi = selection;
      p.bot.hardware.informational_settings.target = target;
      const { container } = render(<RpiModel {...p} />);
      expect(container.innerHTML).not.toContain("fa-times-circle");
    });
});

describe("<StatusDetails />", () => {
  const fakeProps = (): StatusDetailsProps => ({
    selection: "3",
    target: "rpi3",
    firmwareHardware: "arduino",
  });

  it.each(TEST_CASES)("renders details: %s %s %s %s",
    (selection, target, firmwareHardware, expected) => {
      const p = fakeProps();
      p.selection = selection;
      p.target = target;
      p.firmwareHardware = firmwareHardware;
      const { container } = render(<StatusDetails {...p} />);
      expect((container.textContent || "").toLowerCase()).toContain(expected);
    });

  it("renders unknown", () => {
    const p = fakeProps();
    p.selection = undefined;
    p.target = "";
    p.firmwareHardware = undefined;
    const { container } = render(<StatusDetails {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("unknown");
  });
});
