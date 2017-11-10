import { GetState } from "../redux/interfaces";
import { maybeDetermineUuid } from "../resources/selectors";
import { ResourceName, TaggedResource, SpecialStatus } from "../resources/tagged_resources";
import { overwrite, init } from "../api/crud";
import { handleInbound } from "./auto_sync_handle_inbound";
import { SyncPayload, MqttDataResult, Reason, UpdateMqttData } from "./interfaces";

export function decodeBinary(payload: Buffer): SyncPayload {
  return JSON.parse((payload).toString());
}

export function routeMqttData(chan: string, payload: Buffer): MqttDataResult {
  /** Skip irrelevant messages */
  if (!chan.includes("sync")) { return { status: "SKIP" }; }

  /** Extract, Validate and scrub the data as it enters the frontend. */
  const parts = chan.split("/");
  if (parts.length !== 5) { return { status: "ERR", reason: Reason.BAD_CHAN }; }

  const id = parseInt(parts.pop() || "0", 10);
  const kind = parts.pop() as ResourceName;
  const { body, args } = decodeBinary(payload);

  if (body) {
    return { status: "UPDATE", body, kind: kind, id, sessionId: args.label };
  } else {
    return { status: "DELETE", kind: kind, id }; // 'null' body means delete.
  }
}

export const asTaggedResource =
  (data: UpdateMqttData, uuid: string): TaggedResource => {
    return {
      // tslint:disable-next-line:no-any
      kind: (data.kind as any),
      uuid,
      specialStatus: SpecialStatus.SAVED,
      // tslint:disable-next-line:no-any
      body: (data.body as any) // I trust you, API...
    };
  };

export const handleCreate =
  (data: UpdateMqttData) => init(asTaggedResource(data, "IS SET LATER"), true);

export const handleUpdate =
  (d: UpdateMqttData, uid: string) => {
    const tr = asTaggedResource(d, uid);
    return overwrite(tr, tr.body, SpecialStatus.SAVED);
  };

export function handleCreateOrUpdate(dispatch: Function,
  getState: GetState,
  data: UpdateMqttData) {

  const state = getState();
  const { index } = state.resources;
  const uuid = maybeDetermineUuid(index, data.kind, data.id);
  if (uuid) {
    return dispatch(handleUpdate(data, uuid));
  } else {
    // Here be dragons.
    // PROBLEM:  You see incoming `UPDATE` messages.
    //           How do you know if it is a new record or an update to
    //           an existing?
    // SOLUTION: Every inbound message has a `sessionId` that matches the `jwt`
    //           of your JSON Web Token. If the `sessionId` is equal to your
    //           JWT, then you can disregard the sync message- you probably
    //           already got the data when your AJAX request finished.
    // The ultimate problem: We need to know if the incoming data update was created
    // by us or some other user. That information lets us know if we are UPDATEing
    // data or INSERTing data.
    const jti = state.auth && state.auth.token.unencoded.jti;
    debugger;
    if (data.sessionId === jti) { // Ignore local echo?
      // console.log("Ignoring echo");
    } else {
      dispatch(handleCreate(data));
    }
  }
}

export const autoSync =
  (dispatch: Function, getState: GetState) =>
    (chan: string, payload: Buffer) => {
      handleInbound(dispatch, getState, routeMqttData(chan, payload));
    };
