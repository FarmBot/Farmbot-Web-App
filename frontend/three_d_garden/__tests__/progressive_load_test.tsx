import React from "react";
import * as reactSpring from "@react-spring/three";
import TestRenderer from "react-test-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";
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

  it("keeps children mounted without resting before reveal", () => {
    const onRest = jest.fn();
    const { rerender } = render(<PopInGroup
      name={"bed-load-in"}
      reveal={false}
      onRest={onRest}>
      <span>content</span>
    </PopInGroup>);

    expect(screen.getByText("content")).toBeTruthy();
    expect(onRest).not.toHaveBeenCalled();

    rerender(<PopInGroup
      name={"bed-load-in"}
      reveal={true}
      onRest={onRest}>
      <span>content</span>
    </PopInGroup>);

    expect(onRest).toHaveBeenCalled();
  });

  it("hides the group after its exit animation rests", () => {
    let springProps: { onRest(): void } | undefined;
    const useSpringSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementationOnce(props => {
        springProps = props as typeof springProps;
        return {
          position: [0, 0, 0],
          scale: 1,
        } as never;
      });
    let view: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      view = TestRenderer.create(
        <PopInGroup
          name={"bed-load-out"}
          reveal={false}
          animateExit={true}
          hideAfterExit={true}>
          <span>content</span>
        </PopInGroup>,
      );
    });

    TestRenderer.act(() => springProps?.onRest());

    expect(view?.root.findAllByProps({ name: "bed-load-out" })
      .some(node => node.props.visible === false)).toEqual(true);
    useSpringSpy.mockRestore();
    TestRenderer.act(() => view?.unmount());
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

  it("applies fade-in opacity during the load-in spring", () => {
    let springProps: {
      onChange(result: { value: { opacity?: number } }): void;
    } | undefined;
    const useSpringSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementationOnce(props => {
        springProps = props as typeof springProps;
        return {
          position: [0, 0, 0],
          scale: 1,
        } as never;
      });

    const root = new Object3D();
    root.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial()));
    let view: TestRenderer.ReactTestRenderer | undefined;

    TestRenderer.act(() => {
      view = TestRenderer.create(
        <FallInGroup name={"bot-load-in"} fadeIn={true}>
          <span>bot</span>
        </FallInGroup>,
        { createNodeMock: node => node.type == "group" ? root : {} },
      );
    });
    TestRenderer.act(() =>
      springProps?.onChange({ value: { opacity: 0.5 } }));

    expect(useSpringSpy).toHaveBeenCalled();
    TestRenderer.act(() => view?.unmount());
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

  it("fades from transparent to fully visible while revealing", () => {
    let springProps: {
      from: { opacity: number };
      to: { opacity: number };
    } | undefined;
    const useSpringSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementationOnce(props => {
        springProps = props as typeof springProps;
        return {
          position: [0, 0, 0],
          scale: 1,
        } as never;
      });

    let view: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      view = TestRenderer.create(
        <GridRevealGroup name={"grid-load-in"}>
          <span>grid</span>
        </GridRevealGroup>,
        { createNodeMock: () => new Object3D() },
      );
    });

    expect(springProps?.from.opacity).toEqual(0);
    expect(springProps?.to.opacity).toEqual(1);
    useSpringSpy.mockRestore();
    TestRenderer.act(() => view?.unmount());
  });
});

describe("3D load progress", () => {
  const ProgressHarness = () => {
    const progress = useThreeDLoadProgress();
    const currentStep = progress.currentStep;
    return <div>
      <ThreeDLoadProgressOverlay progress={progress} />
      <p data-testid={"current-step"}>{currentStep?.id || "complete"}</p>
      <p data-testid={"progress"}>{progress.progress}</p>
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
    expect(screen.getByTestId("progress").textContent).toEqual("0");
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
    expect(screen.getByTestId("progress").textContent).toEqual("100");
    expect(screen.getByText("Enjoy!")).toBeTruthy();
    expect(document.querySelector(".three-d-load-progress-complete"))
      .toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(THREE_D_LOAD_PROGRESS_FADE_MS);
    });
    expect(document.querySelector(".three-d-load-progress")).toBeFalsy();
    expect(consoleLog).not.toHaveBeenCalled();
    consoleLog.mockRestore();
    jest.useRealTimers();
  });

  it("logs load timing when perf logging is enabled", () => {
    jest.useFakeTimers();
    localStorage.setItem("FB_PERF_BENCHMARK", "true");
    const consoleLog = jest.spyOn(console, "log").mockImplementation(jest.fn());
    render(<ProgressHarness />);

    THREE_D_LOAD_STEPS.forEach(() => {
      fireEvent.click(screen.getByText("advance"));
    });

    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining("Total"));
    consoleLog.mockRestore();
    localStorage.clear();
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

  it("can hide before all progress steps are ready", () => {
    jest.useFakeTimers();
    const CompleteHarness = ({ complete }: { complete: boolean }) => {
      const progress = useThreeDLoadProgress();
      return <ThreeDLoadProgressOverlay
        progress={progress}
        complete={complete} />;
    };

    const { rerender } = render(<CompleteHarness complete={false} />);
    expect(document.querySelector(".three-d-load-progress")).toBeTruthy();

    rerender(<CompleteHarness complete={true} />);

    expect(screen.getByText("Enjoy!")).toBeTruthy();
    expect(document.querySelector(".three-d-load-progress-complete"))
      .toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(THREE_D_LOAD_PROGRESS_FADE_MS);
    });
    expect(document.querySelector(".three-d-load-progress")).toBeFalsy();
    jest.useRealTimers();
  });

  it("doesn't block clicks outside the progress bar", () => {
    render(<ProgressHarness />);

    const html = document.querySelector(".html") as HTMLElement;
    expect(html.style.pointerEvents).toEqual("none");
  });
});
