import { DeepPartial } from "redux";
import { AssertionStepProps as Props } from "../support";
import { fakeSequence } from "../../../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../../../__test_support__/resource_index_builder";

const EMPTY: DeepPartial<Props> = {};

export const fakeAssertProps = (extras = EMPTY): Props => {
  const currentSequence = fakeSequence();
  const resources = buildResourceIndex().index;
  const props: Props = {
    currentSequence,
    currentStep: {
      kind: "assertion",
      args: {
        lua: "return 2 + 2 == 4",
        assertion_type: "continue",
        _then: {
          kind: "execute",
          args: {
            sequence_id: currentSequence.body.id || 0
          }
        }
      }
    },
    dispatch: jest.fn(),
    index: 1,
    resources,
    confirmStepDeletion: false,
  };

  return { ...props, ...(extras as Props) };
};
