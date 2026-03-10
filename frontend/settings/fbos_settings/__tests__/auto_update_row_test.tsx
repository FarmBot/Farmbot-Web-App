import React from "react";
import { AutoUpdateRow } from "../auto_update_row";
import { fireEvent, render } from "@testing-library/react";
import { AutoUpdateRowProps } from "../interfaces";
import * as deviceActions from "../../../devices/actions";

let updateConfigSpy: jest.SpyInstance;

beforeEach(() => {
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn() as never);
});

afterEach(() => {
  updateConfigSpy.mockRestore();
});

describe("<AutoUpdateRow/>", () => {
  const fakeProps = (): AutoUpdateRowProps => ({
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: 1, consistent: true }),
  });

  it("renders", () => {
    const { container } = render(<AutoUpdateRow {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("auto update");
  });

  it("toggles auto-update on", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 0, consistent: true });
    const { container } = render(<AutoUpdateRow {...p} />);
    const toggle = container.querySelector("button");
    if (!toggle) { throw new Error("Expected auto-update toggle button"); }
    fireEvent.click(toggle);
    expect(updateConfigSpy).toHaveBeenCalledWith({ os_auto_update: true });
    expect(p.dispatch).toHaveBeenCalledWith(updateConfigSpy.mock.results[0].value);
  });

  it("toggles auto-update off", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 1, consistent: true });
    const { container } = render(<AutoUpdateRow {...p} />);
    const toggle = container.querySelector("button");
    if (!toggle) { throw new Error("Expected auto-update toggle button"); }
    fireEvent.click(toggle);
    expect(updateConfigSpy).toHaveBeenCalledWith({ os_auto_update: false });
    expect(p.dispatch).toHaveBeenCalledWith(updateConfigSpy.mock.results[0].value);
  });
});
