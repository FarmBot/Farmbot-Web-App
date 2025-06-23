import { DataXfer, DataXferIntent, DataXferBase } from "./interfaces";
import { SequenceBodyItem as Step, uuid as id } from "farmbot";
import { Everything } from "../interfaces";
import { ReduxAction } from "../redux/interfaces";
import React from "react";
import { Actions } from "../constants";
import { UUID } from "../resources/interfaces";
export const STEP_DATATRANSFER_IDENTIFIER = "farmbot/sequence-step";

/** SIDE EFFECT-Y!! Stores a step into store.draggable.dataTransfer and
 * attaches its lookup key to the event object. This allows you to retrieve
 * the step when the "drop" event occurs elsewhere */
export function stepPut(value: Step,
  ev: React.DragEvent<HTMLElement>,
  intent: DataXferIntent,
  draggerId: number,
  resourceUuid?: UUID):
  ReduxAction<DataXferBase> {
  const uuid = id();
  ev.dataTransfer.setData(STEP_DATATRANSFER_IDENTIFIER, uuid);
  return {
    type: Actions.PUT_DATA_XFER,
    payload: {
      intent,
      uuid,
      value,
      draggerId,
      resourceUuid,
    }
  };
}

/** Used by a React component reacting to a "drop" event. Takes a UUID and looks
 * for a step stored in store.draggable.data_transfer. Removes it from the store
 * and returns it to the component. */
export function stepGet(uuid: string) {
  return function (dispatch: Function,
    getState: () => Everything):
    DataXfer {
    const obj = getState().draggable.dataTransfer[uuid];
    if (obj && obj.intent) {
      dispatch({ type: Actions.DROP_DATA_XFER, payload: uuid });
      return obj;
    } else {
      throw new Error(`Can't find StepXferObject with UUID ${uuid}`);
    }
  };
}
