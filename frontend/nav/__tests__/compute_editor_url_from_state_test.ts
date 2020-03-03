const mockSeqUUID = "sequence.1.2";
const mockSeqName = "Sequence 123";
const mockRegUUID = "Regimen.1.2";
const mockRegName = "Regimen 123";
const mockFarmwareName = "Farmware 1";
const mockState = {
  resources: {
    consumers: {
      sequences: { current: mockSeqUUID },
      regimens: { currentRegimen: mockRegUUID },
      farmware: { currentFarmware: mockFarmwareName }
    },
    index: {
      references: {
        [mockSeqUUID]: { kind: "Sequence", body: { name: mockSeqName } },
        [mockRegUUID]: { kind: "Regimen", body: { name: mockRegName } }
      }
    }
  }
};

jest.mock("../../redux/store", () => {
  return { store: { getState: jest.fn(() => mockState) } };
});

import {
  computeEditorUrlFromState, computeFarmwareUrlFromState,
} from "../compute_editor_url_from_state";

describe("computeEditorUrlFromState", () => {
  it("computes a URL when no sequence is selected", () => {
    mockState.resources.consumers.sequences.current = "";
    const result = computeEditorUrlFromState("Sequence")("", "");
    expect(result).toBe("/app/sequences/");
  });

  it("computes another URL when a sequence _is_ selected", () => {
    mockState.resources.consumers.sequences.current = mockSeqUUID;
    const result = computeEditorUrlFromState("Sequence")("", "");
    expect(result).toBe("/app/sequences/sequence_123");
  });

  it("computes a URL when no regimen is selected", () => {
    mockState.resources.consumers.regimens.currentRegimen = "";
    const result = computeEditorUrlFromState("Regimen")("", "");
    expect(result).toBe("/app/regimens/");
  });

  it("computes another URL when a regimen _is_ selected", () => {
    mockState.resources.consumers.regimens.currentRegimen = mockRegUUID;
    const result = computeEditorUrlFromState("Regimen")("", "");
    expect(result).toBe("/app/regimens/regimen_123");
  });
});

describe("computeFarmwareUrlFromState()", () => {
  it("computes base URL", () => {
    mockState.resources.consumers.farmware.currentFarmware = "";
    const result = computeFarmwareUrlFromState();
    expect(result).toBe("/app/farmware/");
  });

  it("computes base + farmware URL", () => {
    mockState.resources.consumers.farmware.currentFarmware = "Farmware 1";
    const result = computeFarmwareUrlFromState();
    expect(result).toBe("/app/farmware/farmware_1");
  });
});
