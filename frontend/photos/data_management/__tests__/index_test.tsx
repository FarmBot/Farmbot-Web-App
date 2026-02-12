let mockDev = false;
jest.mock("../../../settings/dev/dev_support", () => {
  const actual = jest.requireActual("../../../settings/dev/dev_support");
  return {
    ...actual,
    DevSettings: {
      ...actual.DevSettings,
      showInternalEnvsEnabled: () => mockDev,
      overriddenFbosVersion: jest.fn(),
    },
  };
});

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ImagingDataManagement } from "../index";
import { ImagingDataManagementProps } from "../interfaces";

afterAll(() => {
  jest.unmock("../../../settings/dev/dev_support");
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
