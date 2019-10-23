import { FarmEventWithExecutable } from "./interfaces";
import { ResourceIndex } from "../../../resources/interfaces";
import {
  selectAllFarmEvents,
  indexSequenceById,
  indexRegimenById
} from "../../../resources/selectors";
import { betterCompact } from "../../../util";
import { TaggedFarmEvent } from "farmbot";

export function joinFarmEventsToExecutable(
  input: ResourceIndex): FarmEventWithExecutable[] {
  const farmEvents: TaggedFarmEvent[] = selectAllFarmEvents(input);
  const sequenceById = indexSequenceById(input);
  const regimenById = indexRegimenById(input);

  return betterCompact(farmEvents.map(function (fe) {
    const body = fe.body;
    const id = fe.body.executable_id;
    if (id) {
      switch (body.executable_type) {
        case "Sequence":
          const executable1 = sequenceById[id];
          if (executable1) {
            return {
              ...body,
              executable_type: body.executable_type,
              executable: executable1.body
            };
          }
          break;
        case "Regimen":
          const executable2 = regimenById[id];
          if (executable2) {
            return {
              ...body,
              executable_type: body.executable_type,
              executable: executable2.body
            };
          }
      }
    }
    throw new Error("Impossible?");
  }));
}
