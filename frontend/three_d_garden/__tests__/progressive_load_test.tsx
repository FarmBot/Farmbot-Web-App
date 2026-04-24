import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  FallInGroup, GridRevealGroup, LoadStepReady, PopInGroup,
  THREE_D_LOAD_STEPS, ThreeDLoadProgressOverlay, useThreeDLoadProgress,
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
      <button onClick={() => currentStep && progress.markStep(currentStep.id)}>
        advance
      </button>
    </div>;
  };

  it("marks ready steps and hides the progress bar when complete", () => {
    const consoleLog = jest.spyOn(console, "log").mockImplementation(jest.fn());
    render(<ProgressHarness />);

    expect(screen.getByTestId("current-step").textContent)
      .toEqual("environment");
    expect(screen.getByTestId("bed-allowed").textContent).toEqual("false");
    expect(document.querySelector(".three-d-load-progress")).toBeTruthy();
    THREE_D_LOAD_STEPS.forEach(step => {
      expect(screen.getByTestId("current-step").textContent).toEqual(step.id);
      fireEvent.click(screen.getByText("advance"));
    });

    expect(screen.getByTestId("current-step").textContent).toEqual("complete");
    expect(document.querySelector(".three-d-load-progress")).toBeFalsy();
    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining("Total"));
    consoleLog.mockRestore();
  });

  it("marks one step ready", () => {
    const markStep = jest.fn();
    render(<LoadStepReady step={"plants"} markStep={markStep} />);
    expect(markStep).toHaveBeenCalledWith("plants");
  });
});
