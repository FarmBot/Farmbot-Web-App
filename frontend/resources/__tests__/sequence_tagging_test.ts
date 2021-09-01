import { get } from "lodash";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { getStepTag, maybeTagStep } from "../sequence_tagging";

describe("tagAllSteps()", () => {
  const UNTAGGED_SEQUENCE = fakeSequence();
  UNTAGGED_SEQUENCE.body.body = [
    { kind: "move_relative", args: { x: 0, y: 0, z: 0, speed: 100 } },
  ];
  it("adds a UUID property to steps", () => {
    const body = UNTAGGED_SEQUENCE.body.body || [];
    expect(body.length).toEqual(1);
    expect(get(body[0], "uuid")).not.toBeDefined();
    expect(() => {
      getStepTag(body[0]);
    }).toThrow();
    maybeTagStep(body[0]);
    expect(get(body[0], "uuid")).toBeDefined();
  });
});
