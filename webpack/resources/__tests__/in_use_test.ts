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

  const assertShape =
    (inUse: UsageIndex, expected: DeepPartial<UsageIndex>) => {
      EVERY_USAGE_KIND.map(kind => expect(inUse[kind]).toEqual(expected[kind] || {}));
    };

  it("loads defaults", () => assertShape(testCase([]).inUse, {}));

  it("does not track self-referencing Sequences", () => {
    const selfReferential = fakeSequence();
    const sequence_id = selfReferential.body.id;
    if (sequence_id) {
      selfReferential.body.body = [{ kind: "execute", args: { sequence_id } }];
      const { inUse } = testCase([selfReferential]);
      assertShape(inUse, {});
    } else {
      fail("Need an ID for this one.");
    }
  });

  it("handles a sequence that calls many sequences", () => {
    const s1 = fakeSequence();
    const s2 = fakeSequence();
    const s3 = fakeSequence();
    if (s1.body.id && s2.body.id) {
      s1.body.body = [
        { kind: "execute", args: { sequence_id: s3.body.id || -0 } },
        { kind: "execute", args: { sequence_id: s2.body.id || -0 } },
      ];
      const { inUse } = testCase([s1]);
      assertShape(inUse, {
        "Sequence.Sequence": {
          [s2.uuid]: { [s1.uuid]: true },
          [s3.uuid]: { [s1.uuid]: true },
        }
      });
    } else {
      fail("Need an ID for this one.");
    }
  });

  it("transitions from in_use to not in_use", () => {
    pending();
  });
});
