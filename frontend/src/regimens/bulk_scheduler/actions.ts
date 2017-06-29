import { isNaN, isNumber } from "lodash";
import { t } from "i18next";
import { error, warning } from "farmbot-toastr";
import { ReduxAction, Thunk } from "../../redux/interfaces";
import { ToggleDayParams } from "./interfaces";
import { assertUuid, findSequence, findRegimen } from "../../resources/selectors";
import { groupRegimenItemsByWeek } from "./group_regimen_items_by_week";
import { defensiveClone } from "../../util";
import { overwrite } from "../../api/crud";

export function pushWeek() {
  return {
    type: "PUSH_WEEK"
  };
}

export function popWeek() {
  return {
    type: "POP_WEEK"
  };
}

/** Sets daily offset of a regimen */
export function setTimeOffset(ms: number) {
  if (isNaN(ms) || !isNumber(ms)) {
    warning("Time is not properly formatted.", "Bad Input");
    throw new Error("Bad time input on regimen page: " + JSON.stringify(ms));
  } else {
    return { type: "SET_TIME_OFFSET", payload: ms };
  };
}

export function toggleDay({ week, day }: ToggleDayParams) {
  return {
    type: "TOGGLE_DAY",
    payload: {
      week,
      day
    }
  };
}

export function setSequence(uuid: string): ReduxAction<string> {
  assertUuid("sequences", uuid);
  return { type: "SET_SEQUENCE", payload: uuid };
};

export function commitBulkEditor(): Thunk {
  return function(dispatch, getState) {
    let res = getState().resources;
    let { weeks, dailyOffsetMs, selectedSequenceUUID, currentRegimen } =
      res.consumers.regimens;

    // If the user hasn't clicked a regimen, initialize one for them.
    if (currentRegimen) {
      // Proceed only if they selected a sequence from the drop down.
      if (selectedSequenceUUID) {
        let seq = findSequence(res.index, selectedSequenceUUID).body;
        const regimenItems = groupRegimenItemsByWeek(weeks, dailyOffsetMs, seq);
        // Proceed only if days are selcted in the scheduler.
        if (regimenItems.length > 0) {
          let reg = findRegimen(res.index, currentRegimen);
          let update = defensiveClone(reg).body;
          update.regimen_items = update.regimen_items.concat(regimenItems);
          dispatch(overwrite(reg, update));
        } else {
          return error(t("No day(s) selected."));
        }
      } else {
        return error(t("Select a sequence from the dropdown first."));
      }
    } else {
      return error(t("Select a regimen first or create one."));
    }
  };
}
