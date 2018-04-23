import { GetState } from "../redux/interfaces";
import { handleCreateOrUpdate } from "./auto_sync";
import { maybeDetermineUuid } from "../resources/selectors";
import { destroyOK } from "../resources/actions";
import { MqttDataResult } from "./interfaces";

export function handleInbound(dispatch: Function,
  getState: GetState,
  data: MqttDataResult) {
  console.log("Ding");
  switch (data.status) {
    case "ERR":
    case "SKIP":
      return;
    case "UPDATE":
      return handleCreateOrUpdate(dispatch, getState, data);
    case "DELETE":
      const i = getState().resources.index;
      const r = i.references[maybeDetermineUuid(i, data.kind, data.id) || "NO"];
      return r ? dispatch(destroyOK(r)) : undefined; // Dont delete untracked.
  }
}
