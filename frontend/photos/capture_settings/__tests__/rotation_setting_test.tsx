import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  RotationSetting, DISABLE_ROTATE_AT_CAPTURE_KEY,
} from "../rotation_setting";
import { RotationSettingProps } from "../interfaces";

describe("<RotationSetting />", () => {
  const fakeProps = (): RotationSettingProps => ({
    env: {},
    saveFarmwareEnv: jest.fn(),
    dispatch: jest.fn(),
    version: "1.0.14",
  });

  it("toggles setting on", () => {
    const p = fakeProps();
    render(<RotationSetting {...p} />);
    fireEvent.click(screen.getByRole("button", { hidden: true }));
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      DISABLE_ROTATE_AT_CAPTURE_KEY, "1");
  });

  it("toggles setting off", () => {
    const p = fakeProps();
    p.env = { [DISABLE_ROTATE_AT_CAPTURE_KEY]: "1" };
    render(<RotationSetting {...p} />);
    fireEvent.click(screen.getByRole("button", { hidden: true }));
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      DISABLE_ROTATE_AT_CAPTURE_KEY, "0");
  });

  it.each<["yes" | "no" | undefined, string | undefined, string]>([
    ["yes", undefined, "1.0.14"],
    ["no", undefined, "1.0.15"],
    ["no", "1", "1.0.13"],
    ["no", "1", "1.0.14"],
    ["no", "1", "1.0.15"],
    ["yes", "0", "1.0.13"],
    ["yes", "0", "1.0.14"],
    ["yes", "0", "1.0.15"],
  ])("renders correct state: %s for env: %s and version: %s",
    (label, envValue, version) => {
      const p = fakeProps();
      p.version = version;
      p.env = { [DISABLE_ROTATE_AT_CAPTURE_KEY]: envValue };
      const { container } = render(<RotationSetting {...p} />);
      if (!label) {
        expect(container.querySelector(".capture-rotate-setting")).toBeNull();
        return;
      }
      const text = (screen.getByRole("button", { hidden: true }).textContent || "").toLowerCase();
      const expected = label.toLowerCase();
      const equivalent = expected === "yes" ? "true" : "false";
      expect([expected, equivalent]).toContain(text);
    });
});
