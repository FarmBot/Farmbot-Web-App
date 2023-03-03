import {
  fakeFarmEvent, fakeSequence, fakeRegimen,
} from "../../../__test_support__/fake_state/resources";
const mockSequence = fakeSequence();
mockSequence.body.id = 1;
const mockSeqFarmEvent = fakeFarmEvent(mockSequence.kind, mockSequence.body.id);
mockSeqFarmEvent.body.id = 10;
const mockRegimen = fakeRegimen();
mockRegimen.body.id = 2;
const mockRegFarmEvent = fakeFarmEvent(mockRegimen.kind, mockRegimen.body.id);
mockRegFarmEvent.body.id = 20;
jest.mock("../../../resources/selectors", () => ({
  selectAllFarmEvents: () => [mockSeqFarmEvent, mockRegFarmEvent],
  indexSequenceById: () => ({ 1: mockSequence }),
  indexRegimenById: () => ({ 2: mockRegimen }),
  selectAllPlantPointers: () => [],
  findUuid: jest.fn(),
}));

import { joinFarmEventsToExecutable } from "../selectors";
import { ResourceIndex } from "../../../resources/interfaces";

describe("joinFarmEventsToExecutable()", () => {
  it("joins farm events with executable", () => {
    const result = joinFarmEventsToExecutable({} as ResourceIndex);
    expect(result.length).toEqual(2);
    const joinedSeqFarmEvent = result.find(x => x.executable_type == "Sequence");
    expect(joinedSeqFarmEvent?.executable.id).toEqual(mockSequence.body.id);
    expect(joinedSeqFarmEvent?.id).toEqual(mockSeqFarmEvent.body.id);
    const joinedRegFarmEvent = result.find(x => x.executable_type == "Regimen");
    expect(joinedRegFarmEvent?.executable.id).toEqual(mockRegimen.body.id);
    expect(joinedRegFarmEvent?.id).toEqual(mockRegFarmEvent.body.id);
  });

  it("throws error for missing executable", () => {
    mockSeqFarmEvent.body.executable_id = 123;
    mockRegFarmEvent.body.executable_id = 456;
    expect(() => joinFarmEventsToExecutable({} as ResourceIndex)).toThrow();
  });

  it("throws error for missing executable id", () => {
    mockSeqFarmEvent.body.executable_id = 0;
    mockRegFarmEvent.body.executable_id = 0;
    expect(() => joinFarmEventsToExecutable({} as ResourceIndex)).toThrow();
  });
});
