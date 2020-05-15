let mockDev = false;
jest.mock("../../account/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeSequence, fakeRegimen, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
const mockState = fakeState();
const mockSequence = fakeSequence();
mockSequence.body.name = "Sequence 123";
const mockRegimen = fakeRegimen();
mockRegimen.body.name = "Regimen 123";
mockState.resources = buildResourceIndex([
  fakeWebAppConfig(), mockSequence, mockRegimen]);
mockState.resources.consumers.sequences.current = mockSequence.uuid;
mockState.resources.consumers.regimens.currentRegimen = mockRegimen.uuid;
const mockFarmwareName = "Farmware 1";
mockState.resources.consumers.farmware.currentFarmware = mockFarmwareName;
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
    mockState.resources.consumers.sequences.current = mockSequence.uuid;
    const result = computeEditorUrlFromState("Sequence")("", "");
    expect(result).toBe("/app/sequences/sequence_123");
  });

  it("computes a URL when no regimen is selected", () => {
    mockState.resources.consumers.regimens.currentRegimen = "";
    const result = computeEditorUrlFromState("Regimen")("", "");
    expect(result).toBe("/app/regimens/");
  });

  it("computes another URL when a regimen _is_ selected", () => {
    mockState.resources.consumers.regimens.currentRegimen = mockRegimen.uuid;
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

  it("computes new base + farmware URL", () => {
    mockDev = true;
    mockState.resources.consumers.farmware.currentFarmware = "Farmware 1";
    const result = computeFarmwareUrlFromState();
    expect(result).toBe("/app/designer/farmware/farmware_1");
    mockDev = false;
  });
});
