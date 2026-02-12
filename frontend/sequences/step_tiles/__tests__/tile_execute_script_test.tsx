import React from "react";
import {
  DefaultFarmwareStep, FarmwareName, TileExecuteScript,
} from "../tile_execute_script";
import { render, fireEvent, screen } from "@testing-library/react";
import { ExecuteScript } from "farmbot";
import { StepParams } from "../../interfaces";
import {
  fakeFarmwareData, fakeStepParams,
} from "../../../__test_support__/fake_sequence_step_data";

describe("<TileExecuteScript />", () => {
  const fakeProps = (): StepParams<ExecuteScript> => {
    const farmwareData = fakeFarmwareData();
    farmwareData.farmwareNames = ["one", "two", "three"];
    farmwareData.firstPartyFarmwareNames = ["one"];
    farmwareData.farmwareConfigs = { "farmware-to-execute": [] };
    return {
      ...fakeStepParams({
        kind: "execute_script",
        args: { label: "farmware-to-execute" }
      }),
      farmwareData,
    };
  };

  it("renders inputs", () => {
    const { container } = render(<TileExecuteScript {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(2);
    expect((inputs[0] as HTMLInputElement).placeholder).toEqual("Run Farmware");
    expect((labels[0] as HTMLElement).textContent).toEqual("Package Name");
    expect((labels[1] as HTMLElement).textContent).toEqual("Manual input");
    expect((inputs[1] as HTMLInputElement).value).toEqual("farmware-to-execute");
  });

  it("renders farmware list", () => {
    render(<DefaultFarmwareStep {...fakeProps()} />);
    fireEvent.click(screen.getByText("Manual Input"));
    expect(screen.getByText("two")).toBeTruthy();
    expect(screen.getByText("three")).toBeTruthy();
    expect(screen.queryByText("one")).toBeNull();
  });

  it("doesn't show 1st party in list", () => {
    const p = fakeProps();
    p.farmwareData && (p.farmwareData.showFirstPartyFarmware = true);
    render(<DefaultFarmwareStep {...p} />);
    fireEvent.click(screen.getByText("Manual Input"));
    expect(screen.getByText("two")).toBeTruthy();
    expect(screen.getByText("three")).toBeTruthy();
    expect(screen.queryByText("one")).toBeNull();
  });

  it("doesn't show manual input if installed farmware is selected", () => {
    const p = fakeProps();
    p.currentStep.args.label = "two";
    const { container } = render(<TileExecuteScript {...p} />);
    expect(container.querySelectorAll("label").length).toEqual(1);
  });

  it("shows special 1st-party Farmware name: plant detection", () => {
    const p = fakeProps();
    p.currentStep.args.label = FarmwareName.PlantDetection;
    p.farmwareData?.farmwareNames.push(FarmwareName.PlantDetection);
    const { container } = render(<TileExecuteScript {...p} />);
    expect(container.querySelectorAll("label").length).toEqual(0);
    expect((container.textContent || "").toLowerCase())
      .toContain("results are viewable from the photos panel.");
    expect((container.textContent || "").toLowerCase()).not.toContain("package");
  });

  it("shows special 1st-party Farmware name: measure soil height", () => {
    const p = fakeProps();
    p.currentStep.args.label = FarmwareName.MeasureSoilHeight;
    p.farmwareData?.farmwareNames.push(FarmwareName.MeasureSoilHeight);
    const { container } = render(<TileExecuteScript {...p} />);
    expect(container.querySelectorAll("label").length).toEqual(0);
    expect((container.textContent || "").toLowerCase())
      .toContain("results are viewable in the points panel.");
    expect((container.textContent || "").toLowerCase()).not.toContain("package");
  });

  it("renders manual input", () => {
    const p = fakeProps();
    p.farmwareData = undefined;
    const { container } = render(<TileExecuteScript {...p} />);
    expect(container.querySelector("button")?.textContent).toEqual("Manual Input");
    const labels = container.querySelectorAll("label");
    expect((labels[1] as HTMLElement).textContent).toEqual("Manual input");
    const inputs = container.querySelectorAll("input");
    expect((inputs[1] as HTMLInputElement).value).toEqual("farmware-to-execute");
  });

  it("uses drop-down to update step", () => {
    const p = fakeProps();
    render(<DefaultFarmwareStep {...p} />);
    fireEvent.click(screen.getByText("Manual Input"));
    fireEvent.click(screen.getByText("two"));
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("clears body when switching Farmware", () => {
    const p = fakeProps();
    p.currentStep.body = [
      { kind: "pair", args: { label: "x", value: 1 }, comment: "X" }];
    render(<DefaultFarmwareStep {...p} />);
    fireEvent.click(screen.getByText("Manual Input"));
    fireEvent.click(screen.getByText("two"));
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("displays warning when camera is disabled", () => {
    const p = fakeProps();
    p.currentStep.args.label = FarmwareName.PlantDetection;
    p.farmwareData && (p.farmwareData.cameraDisabled = true);
    const { container } = render(<TileExecuteScript {...p} />);
    expect(container.querySelector(".fa-exclamation-triangle")).toBeTruthy();
  });

  it("displays warning when camera is uncalibrated", () => {
    const p = fakeProps();
    p.currentStep.args.label = FarmwareName.PlantDetection;
    p.farmwareData && (p.farmwareData.cameraCalibrated = false);
    const { container } = render(<TileExecuteScript {...p} />);
    expect(container.querySelector(".fa-exclamation-triangle")).toBeTruthy();
  });
});
