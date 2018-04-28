const mockUUID = "sequence.1.2";
const mockName = "Sequence 123";
const mockState = {
  resources: {
    consumers: { sequences: { current: mockUUID } },
    index: {
      references: {
        [mockUUID]: {
          kind: "Sequence",
          body: {
            name: mockName
          }
        }
      }
    }
  }
};

jest.mock("../../redux/store", () => {
  return { store: { getState: jest.fn(() => mockState) } };
});

import { computeSequenceUrlFromState } from "../compute_sequence_url_from_state";

describe("computeSequenceUrlFromState", () => {
  it("computes a URL when no sequence is selected", () => {
    mockState.resources.consumers.sequences.current = "";
    const result = computeSequenceUrlFromState("", "");
    expect(result).toBe("/app/sequences/");
  });

  it("computes another URL when a sequence _is_ selected", () => {
    mockState.resources.consumers.sequences.current = mockUUID;
    const result = computeSequenceUrlFromState("", "");
    expect(result).toBe("/app/sequences/sequence_123");
  });
});
