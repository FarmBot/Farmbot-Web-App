import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import {
  RawDesignerFarmwareAdd as DesignerFarmwareAdd,
  DesignerFarmwareAddProps,
  mapStateToProps,
} from "../add";
import { initSave } from "../../../api/crud";
import * as crud from "../../../api/crud";
import { fakeState } from "../../../__test_support__/fake_state";
import { error } from "../../../toast/toast";
import { Path } from "../../../internal_urls";

let initSaveSpy: jest.SpyInstance;

beforeEach(() => {
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
});

afterEach(() => {
  initSaveSpy.mockRestore();
});
describe("<DesignerFarmwareAdd />", () => {
  const fakeProps = (): DesignerFarmwareAddProps => ({
    dispatch: jest.fn(() => Promise.resolve()),
  });

  it("renders add farmware panel", () => {
    const { container } = render(<DesignerFarmwareAdd {...fakeProps()} />);
    const text = (container.textContent || "").toLowerCase();
    expect(text).toContain("manifest url");
    expect(text).toContain("install");
  });

  it("updates url", () => {
    const { container } = render(<DesignerFarmwareAdd {...fakeProps()} />);
    const urlInput = container.querySelector("input[name=\"url\"]");
    if (!urlInput) { throw new Error("Expected URL input"); }
    fireEvent.change(urlInput, {
      target: { value: "fake url" },
      currentTarget: { value: "fake url" },
    });
    expect((urlInput as HTMLInputElement).value)
      .toEqual("fake url");
  });

  it("adds a new farmware", async () => {
    const { container } = render(<DesignerFarmwareAdd {...fakeProps()} />);
    const urlInput = container.querySelector("input[name=\"url\"]");
    const installButton = container.querySelector(".fb-button.green");
    if (!urlInput || !installButton) {
      throw new Error("Expected install form controls");
    }
    fireEvent.change(urlInput, {
      target: { value: "fake url" },
      currentTarget: { value: "fake url" },
    });
    fireEvent.click(installButton);
    await waitFor(() => {
      expect(initSave).toHaveBeenCalledWith("FarmwareInstallation", {
        url: "fake url",
        package: undefined,
        package_error: undefined,
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.farmware());
    expect(error).not.toHaveBeenCalled();
  });

  it("doesn't add a new farmware", () => {
    const { container } = render(<DesignerFarmwareAdd {...fakeProps()} />);
    const urlInput = container.querySelector("input[name=\"url\"]");
    const installButton = container.querySelector(".fb-button.green");
    if (!urlInput || !installButton) {
      throw new Error("Expected install form controls");
    }
    fireEvent.change(urlInput, {
      target: { value: "" },
      currentTarget: { value: "" },
    });
    fireEvent.click(installButton);
    expect(initSave).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Please enter a URL");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    expect(mapStateToProps(fakeState()).dispatch).toEqual(expect.any(Function));
  });
});
