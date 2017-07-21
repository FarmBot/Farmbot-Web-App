import * as moment from "moment";
import {
  NewCalendarItem,
  FarmEventWithSequence,
  FarmEventWithExecutable,
  FarmEventWithRegimen
} from "./interfaces";
import { ResourceIndex } from "../../../resources/interfaces";
import {
  selectAllFarmEvents,
  indexSequenceById,
  indexRegimenById
} from "../../../resources/selectors";
import { betterCompact } from "../../../util";

export function joinFarmEventsToExecutable(input: ResourceIndex): FarmEventWithExecutable[] {
  let farmEvents = selectAllFarmEvents(input);
  let sequenceById = indexSequenceById(input);
  let regimenById = indexRegimenById(input);

  return betterCompact(farmEvents.map(function (fe) {
    let body = fe.body;
    let id = fe.body.executable_id;
    if (id) {
      switch (body.executable_type) {
        case "Sequence":
          let executable1 = sequenceById[id];
          if (executable1) {
            return {
              ...body,
              executable_type: body.executable_type,
              executable: executable1.body
            };
          } else {
            throw new Error("Bad executable ID (sequence): " + id);
          }
        case "Regimen":
          let executable2 = regimenById[id];
          if (executable2) {
            return {
              ...body,
              executable_type: body.executable_type,
              executable: executable2.body
            };
          } else {
            throw new Error("Bad executable ID (regimen): " + id);
          }
      }
    } else {
      throw new Error("Farmevent had no ID");
    }
  }));
}
