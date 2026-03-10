import React from "react";
import { render } from "@testing-library/react";
import { StepWrapper, StepWrapperProps } from "../step_wrapper";
import {
  fakeSequence, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { emptyState } from "../../../resources/reducer";

describe("<StepWrapper />", () => {
  const fakeProps = (): StepWrapperProps => ({
    className: "step-class",
    helpText: "help text",
    currentSequence: fakeSequence(),
    currentStep: { kind: "take_photo", args: {} },
    dispatch: jest.fn(),
    readOnly: false,
    index: 0,
    children: "child",
    resources: buildResourceIndex([]).index,
    sequencesState: emptyState().consumers.sequences,
  });

  const setStateSync = (instance: StepWrapper) => {
    instance.setState = ((state, callback) => {
      const update = typeof state == "function"
        ? state(instance.state, instance.props)
        : state;
      instance.state = { ...instance.state, ...update };
      callback?.();
    }) as StepWrapper["setState"];
    return instance;
  };

  it("renders", () => {
    const { container } = render(<StepWrapper {...fakeProps()} />);
    const step = container.querySelector(".step-wrapper");
    expect(step?.classList.contains("step-wrapper")).toBeTruthy();
    expect(step?.classList.contains("step-class")).toBeTruthy();
  });

  it("renders pinned sequence", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.pinned = true;
    sequence.body.color = "red";
    p.currentStep = { kind: "execute", args: { sequence_id: 1 } };
    p.resources = buildResourceIndex([sequence]).index;
    const { container } = render(<StepWrapper {...p} />);
    expect(container.querySelector(".step-content")?.classList.contains("red"))
      .toBeTruthy();
  });

  it("toggles celery script view", () => {
    const p = fakeProps();
    const config = fakeWebAppConfig();
    config.body.view_celery_script = true;
    p.resources = buildResourceIndex([config]).index;
    const instance = setStateSync(new StepWrapper(p));
    expect(instance.state.viewRaw).toEqual(undefined);
    const { container, rerender } = render(instance.render());
    expect(container.textContent?.toLowerCase()).toContain("args");
    instance.toggleViewRaw?.();
    expect(instance.state.viewRaw).toEqual(false);
    rerender(instance.render());
    expect(container.textContent?.toLowerCase()).not.toContain("args");
  });

  it("sets element key", () => {
    const p = fakeProps();
    const instance = setStateSync(new StepWrapper(p));
    expect(instance.state.updateKey).toEqual(undefined);
    instance.setKey("code");
    expect(instance.state.updateKey).toEqual("code");
  });
});
