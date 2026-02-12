jest.mock("../../../api/crud", () => ({ initSave: jest.fn() }));

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  RawDesignerFarmwareAdd as DesignerFarmwareAdd,
  DesignerFarmwareAddProps,
  mapStateToProps,
} from "../add";
import { initSave } from "../../../api/crud";
import { fakeState } from "../../../__test_support__/fake_state";
import { error } from "../../../toast/toast";
import { Path } from "../../../internal_urls";

afterAll(() => {
  jest.unmock("../../../api/crud");
});
describe("<DesignerFarmwareAdd />", () => {
  const fakeProps = (): DesignerFarmwareAddProps => ({
    dispatch: jest.fn(() => Promise.resolve()),
  });

  it("renders add farmware panel", () => {
    const { container } = render(<DesignerFarmwareAdd {...fakeProps()} />);
    ["install new farmware", "manifest url"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
  });

  it("updates url", () => {
    const { container } = render(<DesignerFarmwareAdd {...fakeProps()} />);
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "fake url" },
      currentTarget: { value: "fake url" },
    });
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("fake url");
  });

  it("adds a new farmware", async () => {
    const { container } = render(<DesignerFarmwareAdd {...fakeProps()} />);
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "fake url" },
      currentTarget: { value: "fake url" },
    });
    fireEvent.click(container.querySelector("button") as Element);
    await Promise.resolve();
    expect(initSave).toHaveBeenCalledWith("FarmwareInstallation", {
      url: "fake url",
      package: undefined,
      package_error: undefined,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.farmware());
    expect(error).not.toHaveBeenCalled();
  });

  it("doesn't add a new farmware", () => {
    const { container } = render(<DesignerFarmwareAdd {...fakeProps()} />);
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "" },
      currentTarget: { value: "" },
    });
    fireEvent.click(container.querySelector("button") as Element);
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
