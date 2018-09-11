import { fakeMarkAsProps } from "../assertion_support";
import { commitStepChanges } from "../commit_step_changes";
import { ResourceUpdate, TaggedSequence } from "farmbot";
import { Actions } from "../../../../constants";

describe("commitSelection", () => {
  it("commits changes in a <MarkAs/> component", () => {
    const p = fakeMarkAsProps();
    const results = commitStepChanges({
      nextAction: { label: "X", value: "some_action" },
      nextResource: undefined,
      step: p.currentStep as ResourceUpdate,
      index: p.index,
      sequence: p.currentSequence
    });
    expect(results.type).toBe(Actions.OVERWRITE_RESOURCE);
    const { payload } = results;
    expect(payload.uuid.split(".")[0]).toBe("Sequence");
    const s = payload.update as TaggedSequence["body"];
    expect(s.kind).toBe("sequence");
    const step = (s.body || [])[0] as ResourceUpdate;
    expect(step.args.value).toBe("some_action");
  });
});
