import {
  fakeFarmEvent, fakeSequence, fakeRegimen,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

import { joinFarmEventsToExecutable } from "../selectors";

describe("joinFarmEventsToExecutable()", () => {
  const buildIndex = (sequenceId = 1, regimenId = 2) => {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const seqFarmEvent = fakeFarmEvent(sequence.kind, sequenceId);
    seqFarmEvent.body.id = 10;
    const regimen = fakeRegimen();
    regimen.body.id = 2;
    const regFarmEvent = fakeFarmEvent(regimen.kind, regimenId);
    regFarmEvent.body.id = 20;
    const resourceIndex = buildResourceIndex([
      sequence,
      regimen,
    ]).index;
    resourceIndex.references[seqFarmEvent.uuid] = seqFarmEvent;
    resourceIndex.references[regFarmEvent.uuid] = regFarmEvent;
    resourceIndex.byKind.FarmEvent[seqFarmEvent.uuid] = seqFarmEvent.uuid;
    resourceIndex.byKind.FarmEvent[regFarmEvent.uuid] = regFarmEvent.uuid;
    return {
      sequence,
      regimen,
      seqFarmEvent,
      regFarmEvent,
      index: resourceIndex,
    };
  };

  it("joins farm events with executable", () => {
    const { sequence, regimen, seqFarmEvent, regFarmEvent, index } = buildIndex();
    const result = joinFarmEventsToExecutable(index);
    expect(result.length).toEqual(2);
    const joinedSeqFarmEvent = result.find(x => x.executable_type == "Sequence");
    expect(joinedSeqFarmEvent?.executable.id).toEqual(sequence.body.id);
    expect(joinedSeqFarmEvent?.id).toEqual(seqFarmEvent.body.id);
    const joinedRegFarmEvent = result.find(x => x.executable_type == "Regimen");
    expect(joinedRegFarmEvent?.executable.id).toEqual(regimen.body.id);
    expect(joinedRegFarmEvent?.id).toEqual(regFarmEvent.body.id);
  });

  it("throws error for missing executable", () => {
    const { index } = buildIndex(123, 456);
    expect(() => joinFarmEventsToExecutable(index)).toThrow();
  });

  it("throws error for missing executable id", () => {
    const { index } = buildIndex(0, 0);
    expect(() => joinFarmEventsToExecutable(index)).toThrow();
  });
});
