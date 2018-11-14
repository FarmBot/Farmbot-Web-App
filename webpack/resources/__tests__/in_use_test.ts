import { TaggedSequence } from "farmbot";
import { ResourceIndex } from "../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { EVERY_USAGE_KIND, UsageIndex } from "../in_use";
import { DeepPartial } from "redux";
import { fakeSequence } from "../../__test_support__/fake_state/resources";

describe("in_use tracking at reducer level", () => {
  function testCase(sequences: TaggedSequence[]): ResourceIndex {
    return buildResourceIndex(sequences).index;
  }

  const assertEmpty =
    (inUse: UsageIndex, expected: DeepPartial<UsageIndex> = {}) => {
      EVERY_USAGE_KIND.map(kind => expect(inUse[kind]).toEqual(expected[kind] || {}));
    };

  it("loads defaults", () => {
    const { inUse } = testCase([]);
    assertEmpty(inUse);
  });

  it("does not track self-referencing Sequences", () => {
    const selfReferential = fakeSequence();
    pending();
  });

  it("handles a sequence that calls many sequences", () => {
    pending();
  });

  it("transitions from in_use to not in_use", () => {
    pending();
  });
});
