import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  ChangeFirmwarePath, ChangeFirmwarePathProps,
  FirmwarePathRow, FirmwarePathRowProps,
} from "../firmware_path";
import * as deviceActions from "../../../devices/actions";

jest.mock("../../../ui", () => {
  const actual = jest.requireActual("../../../ui");
  return {
    ...actual,
    FBSelect: (props: {
      onChange: (ddi: { label: string, value: string }) => void,
    }) =>
      <div>
        <button onClick={() => props.onChange({ label: "", value: "path" })}>
          select-path
        </button>
        <button onClick={() => props.onChange({ label: "", value: "manual" })}>
          select-manual
        </button>
      </div>,
  };
});

let updateConfigSpy: jest.SpyInstance;

beforeEach(() => {
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("<FirmwarePathRow />", () => {
  const fakeProps = (): FirmwarePathRowProps => ({
    dispatch: jest.fn(),
    firmwarePath: "tty",
    showAdvanced: true,
  });

  it("renders", () => {
    const { container } = render(<FirmwarePathRow {...fakeProps()} />);
    expect(container.textContent).toContain("tty");
  });

  it("renders: path not set", () => {
    const p = fakeProps();
    p.firmwarePath = "";
    const { container } = render(<FirmwarePathRow {...p} />);
    expect(container.textContent).toContain("not set");
  });
});

describe("<ChangeFirmwarePath />", () => {
  const fakeProps = (): ChangeFirmwarePathProps => ({
    dispatch: jest.fn(),
    firmwarePath: "tty",
  });

  it("changes path", () => {
    render(<ChangeFirmwarePath {...fakeProps()} />);
    fireEvent.click(screen.getByText("select-path"));
    expect(updateConfigSpy).toHaveBeenCalledWith({ firmware_path: "path" });
  });

  it("selects manual input", () => {
    render(<ChangeFirmwarePath {...fakeProps()} />);
    fireEvent.click(screen.getByText("select-manual"));
    expect(updateConfigSpy).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "path" } });
    fireEvent.click(screen.getByTitle("submit"));
    expect(updateConfigSpy).toHaveBeenCalledWith({ firmware_path: "path" });
  });
});
