import { GetState } from "../redux/interfaces";
import { maybeDetermineUuid } from "../resources/selectors";
import { ResourceName, TaggedResource } from "../resources/tagged_resources";
import { destroyOK } from "../resources/actions";
import { overwrite, init } from "../api/crud";

interface UpdateMqttData {
  status: "UPDATE"
  kind: ResourceName;
  id: number;
  body: object;
}

interface DeleteMqttData {
  status: "DELETE"
  kind: ResourceName;
  id: number;
}

interface BadMqttData {
  status: "ERR";
  reason: string;
}

interface SkipMqttData {
  status: "SKIP";
}

type MqttDataResult =
  | UpdateMqttData
  | DeleteMqttData
  | SkipMqttData
  | BadMqttData;

enum Reason {
  BAD_KIND = "missing `kind`",
  BAD_ID = "No ID or invalid ID.",
  BAD_CHAN = "Expected exactly 5 segments in channel"
}

function routeMqttData(chan: string, payload: Buffer): MqttDataResult {
  /** Skip irrelevant messages */
  if (!chan.includes("sync")) { return { status: "SKIP" }; }

  /** Extract, Validate and scrub the data as it enters the frontend. */
  const parts = chan.split("/");
  if (parts.length !== 5) { return { status: "ERR", reason: Reason.BAD_CHAN }; }

  const id = parseInt(parts.pop() || "0", 10);
  const kind = parts.pop() as ResourceName | undefined;
  const { body } = JSON.parse((payload).toString()) as { body: {} | null };

  if (!kind) { return { status: "ERR", reason: Reason.BAD_KIND }; }
  if (!id) { return { status: "ERR", reason: Reason.BAD_ID }; }

  if (body) {
    return { status: "UPDATE", body, kind: kind, id };
  } else {
    return { status: "DELETE", kind: kind, id }; // 'null' body means delete.
  }
}

const asTaggedResource = (data: UpdateMqttData, uuid: string): TaggedResource => {
  return {
    // tslint:disable-next-line:no-any
    kind: (data.kind as any),
    uuid,
    specialStatus: undefined,
    // tslint:disable-next-line:no-any
    body: (data.body as any) // I trust you, API...
  };
};

const handleCreate =
  (data: UpdateMqttData) => init(asTaggedResource(data, "IS SET LATER"), true);
const handleUpdate =
  (d: UpdateMqttData, uid: string) => {
    const tr = asTaggedResource(d, uid);
    return overwrite(tr, tr.body);
  };

const handleErr = (d: BadMqttData) => console.log("DATA VALIDATION ERROR!", d);

const handleSkip = () => console.log("SKIP");

export const TempDebug =
  (dispatch: Function, getState: GetState) =>
    (chan: string, payload: Buffer) => {
      const data = routeMqttData(chan, payload);

      switch (data.status) {
        case "ERR": return handleErr(data);
        case "SKIP": return handleSkip();
        case "DELETE":
          const { id, kind } = data;
          const i = getState().resources.index;
          const r = i.references[maybeDetermineUuid(i, kind, id) || "NO"];
          if (r) {
            return dispatch(destroyOK(r));
          } else {
            return;
          }
        case "UPDATE":
          whoah(dispatch, getState, data);
      }
    };

// Here be dragons.
// The ultimate problem: We need to know if the incoming data update was created
// by us or some other user. That information lets us know if we are UPDATEing
// data or INSERTing data.
function whoah(dispatch: Function,
  getState: GetState,
  data: UpdateMqttData,
  backoff = 200) {
  const { index } = getState().resources;
  const uuid = maybeDetermineUuid(index, data.kind, data.id);
  if (uuid) {
    console.log(`Got ${data.kind} ${data.id} after ${backoff}ms`);
    return dispatch(handleUpdate(data, uuid));
  } else {
    // NOTE: This does not mean "300ms have elapsed".
    // It means (200+250+312)ms have elapsed.
    if (backoff > 300) {
      console.log(`I give up on ${data.kind} ${data.id} after ${backoff}ms.`);
      dispatch(handleCreate(data));
    } else {
      setTimeout(() => {
        console.log(`Retrying ${data.kind} ${data.id} (${backoff}ms)...`);
        whoah(dispatch, getState, data, backoff * 1.25); // Recurse
      }, backoff);
    }
  }
}
