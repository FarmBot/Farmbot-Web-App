import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  FallInGroup, GridRevealGroup, LoadStepReady, PopInGroup,
  THREE_D_LOAD_PROGRESS_FADE_MS, THREE_D_LOAD_STEPS,
  ThreeDLoadProgressOverlay, useThreeDLoadProgress,
} from "../progressive_load";

describe("<PopInGroup />", () => {
  it("renders children inside a named load-in group", () => {
    const { container } = render(<PopInGroup name={"bed-load-in"}>
      <span>content</span>
    </PopInGroup>);

    expect(container.innerHTML).toContain("bed-load-in");
    expect(screen.getByText("content")).toBeTruthy();
  });
});

describe("<FallInGroup />", () => {
  it("renders children inside a named load-in group", () => {
    const { container } = render(<FallInGroup name={"bot-load-in"}>
      <span>bot</span>
    </FallInGroup>);

    expect(container.innerHTML).toContain("bot-load-in");
    expect(screen.getByText("bot")).toBeTruthy();
  });
});

describe("<GridRevealGroup />", () => {
  it("renders children inside a named load-in group", () => {
    const { container } = render(<GridRevealGroup name={"grid-load-in"}>
      <span>grid</span>
    </GridRevealGroup>);

    expect(container.innerHTML).toContain("grid-load-in");
    expect(screen.getByText("grid")).toBeTruthy();
  });
});

describe("3D load progress", () => {
  const ProgressHarness = () => {
    const progress = useThreeDLoadProgress();
    const currentStep = progress.currentStep;
    return <div>
      <ThreeDLoadProgressOverlay progress={progress} />
      <p data-testid={"current-step"}>{currentStep?.id || "complete"}</p>
      <p data-testid={"bed-allowed"}>
        {"" + progress.isStepAllowed("bed")}
      </p>
      <p data-testid={"grid-allowed"}>
        {"" + progress.isStepAllowed("grid")}
      </p>
      <p data-testid={"plants-allowed"}>
        {"" + progress.isStepAllowed("plants")}
      </p>
      <p data-testid={"weeds-allowed"}>
        {"" + progress.isStepAllowed("weeds")}
      </p>
      <p data-testid={"points-allowed"}>
        {"" + progress.isStepAllowed("points")}
      </p>
      <p data-testid={"farmbot-allowed"}>
        {"" + progress.isStepAllowed("farmbot")}
      </p>
      <p data-testid={"details-allowed"}>
        {"" + progress.isStepAllowed("details")}
      </p>
      <button onClick={() => currentStep && progress.markStep(currentStep.id)}>
        advance
      </button>
      <button onClick={() => progress.markStep("environment")}>
        mark environment
      </button>
      <button onClick={() => progress.markStep("bed")}>
        mark bed
      </button>
      <button onClick={() => progress.markStep("grid")}>
        mark grid
      </button>
      <button onClick={() => progress.markStep("plants")}>
        mark plants
      </button>
      <button onClick={() => progress.markStep("farmbot")}>
        mark FarmBot
      </button>
    </div>;
  };

  it("marks ready steps and hides the progress bar when complete", () => {
    jest.useFakeTimers();
    const consoleLog = jest.spyOn(console, "log").mockImplementation(jest.fn());
    render(<ProgressHarness />);

    expect(screen.getByTestId("current-step").textContent)
      .toEqual("environment");
    expect(screen.getByTestId("bed-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("grid-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("plants-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("weeds-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("points-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("farmbot-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("details-allowed").textContent).toEqual("false");
    expect(document.querySelector(".three-d-load-progress")).toBeTruthy();
    THREE_D_LOAD_STEPS.forEach(step => {
      expect(screen.getByTestId("current-step").textContent).toEqual(step.id);
      fireEvent.click(screen.getByText("advance"));
    });

    expect(screen.getByTestId("current-step").textContent).toEqual("complete");
    expect(screen.getByText("Enjoy!")).toBeTruthy();
    expect(document.querySelector(".three-d-load-progress-complete"))
      .toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(THREE_D_LOAD_PROGRESS_FADE_MS);
    });
    expect(document.querySelector(".three-d-load-progress")).toBeFalsy();
    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining("Total"));
    consoleLog.mockRestore();
    jest.useRealTimers();
  });

  it("allows steps as soon as their dependencies are ready", () => {
    render(<ProgressHarness />);

    fireEvent.click(screen.getByText("mark environment"));
    expect(screen.getByTestId("bed-allowed").textContent).toEqual("true");
    expect(screen.getByTestId("grid-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("plants-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("weeds-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("points-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("farmbot-allowed").textContent).toEqual("false");

    fireEvent.click(screen.getByText("mark bed"));
    expect(screen.getByTestId("grid-allowed").textContent).toEqual("true");
    expect(screen.getByTestId("plants-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("weeds-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("points-allowed").textContent).toEqual("false");
    expect(screen.getByTestId("farmbot-allowed").textContent).toEqual("false");

    fireEvent.click(screen.getByText("mark grid"));
    expect(screen.getByTestId("plants-allowed").textContent).toEqual("true");
    expect(screen.getByTestId("weeds-allowed").textContent).toEqual("true");
    expect(screen.getByTestId("points-allowed").textContent).toEqual("true");
    expect(screen.getByTestId("farmbot-allowed").textContent).toEqual("true");
    expect(screen.getByTestId("details-allowed").textContent).toEqual("false");

    fireEvent.click(screen.getByText("mark plants"));
    expect(screen.getByTestId("details-allowed").textContent).toEqual("false");

    fireEvent.click(screen.getByText("mark FarmBot"));
    expect(screen.getByTestId("details-allowed").textContent).toEqual("true");
  });

  it("marks one step ready", () => {
    const markStep = jest.fn();
    render(<LoadStepReady step={"plants"} markStep={markStep} />);
    expect(markStep).toHaveBeenCalledWith("plants");
  });
});
