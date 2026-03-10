let mockDev = false;
import * as devSupport from "../../../settings/dev/dev_support";

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ImagingDataManagement } from "../index";
import { ImagingDataManagementProps } from "../interfaces";

let showInternalEnvsEnabledSpy: jest.SpyInstance;
let overriddenFbosVersionSpy: jest.SpyInstance;

beforeEach(() => {
  showInternalEnvsEnabledSpy =
    jest.spyOn(devSupport.DevSettings, "showInternalEnvsEnabled")
      .mockImplementation(() => mockDev);
  overriddenFbosVersionSpy =
    jest.spyOn(devSupport.DevSettings, "overriddenFbosVersion")
      .mockImplementation(jest.fn());
});

afterEach(() => {
  showInternalEnvsEnabledSpy.mockRestore();
  overriddenFbosVersionSpy.mockRestore();
});

describe("<ImagingDataManagement />", () => {
  const fakeProps = (): ImagingDataManagementProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    farmwareEnvs: [],
  });

  it("renders toggle", () => {
    render(<ImagingDataManagement {...fakeProps()} />);
    expect(screen.getByText(/show advanced settings/i)).toBeInTheDocument();
  });

  it("doesn't render advanced", () => {
    mockDev = false;
    render(<ImagingDataManagement {...fakeProps()} />);
    expect(screen.queryByText("Advanced")).toBeNull();
  });

  it("toggles advanced", () => {
    mockDev = true;
    const { container } = render(<ImagingDataManagement {...fakeProps()} />);
    expect(container.querySelector(".farmware-env-editor")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /advanced/i }));
    expect(container.querySelector(".farmware-env-editor")).toBeTruthy();
  });
});
