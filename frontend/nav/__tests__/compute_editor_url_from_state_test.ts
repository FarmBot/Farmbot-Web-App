import { Path } from "../../internal_urls";
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

import { computeEditorUrlFromState } from "../compute_editor_url_from_state";

describe("computeEditorUrlFromState", () => {
  it("computes a URL when no sequence is selected", () => {
    mockState.resources.consumers.sequences.current = "";
    const result = computeEditorUrlFromState("Sequence")();
    expect(result).toBe(Path.designerSequences());
  });

  it("computes another URL when a sequence _is_ selected", () => {
    mockState.resources.consumers.sequences.current = mockSequence.uuid;
    const result = computeEditorUrlFromState("Sequence")();
    expect(result).toBe(Path.designerSequences("Sequence_123"));
  });

  it("computes a URL when no regimen is selected", () => {
    mockState.resources.consumers.regimens.currentRegimen = "";
    const result = computeEditorUrlFromState("Regimen")();
    expect(result).toBe(Path.regimens());
  });

  it("computes another URL when a regimen _is_ selected", () => {
    mockState.resources.consumers.regimens.currentRegimen = mockRegimen.uuid;
    const result = computeEditorUrlFromState("Regimen")();
    expect(result).toBe(Path.regimens("Regimen_123"));
  });
});
