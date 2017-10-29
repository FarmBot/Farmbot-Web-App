import { GetState } from "../redux/interfaces";
import { maybeDetermineUuid } from "../resources/selectors";
import { ResourceName } from "../resources/tagged_resources";
import { ResourceIndex } from "../resources/interfaces";
import { createOK } from "../resources/actions";

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

  /** Extract, Validate and scrub the data */
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

function handleCreate(data: UpdateMqttData,
  dispatch: Function,
  index: ResourceIndex) {

  console.log("Need to raw create resource here...");
  dispatch(createOK({
    kind: (data.kind as any),
    uuid: "NO NO NO",
    specialStatus: undefined,
    body: (data.body as any) // I trust you, API...
  }));

  console.log("INSERT");
}

function handleUpdate(data: UpdateMqttData,
  dispatch: Function,
  index: ResourceIndex,
  uuid: string) {

  console.log("UPDATE");
}

function handleErr(data: BadMqttData) {
  console.log("ERROR", data);
}

function handleSkip() {
  console.log("SKIP");
}

function handleDelete(data: DeleteMqttData) {
  console.log("DELETE");
}

export const TempDebug =
  (dispatch: Function, getState: GetState) =>
    (chan: string, payload: Buffer) => {
      const data = routeMqttData(chan, payload);
      switch (data.status) {
        case "ERR": return handleErr(data);
        case "SKIP": return handleSkip();
        case "DELETE": return handleDelete(data);
        case "UPDATE":
          const { index } = getState().resources;
          const uuid = maybeDetermineUuid(index, data.kind, data.id);
          if (uuid) {
            return handleUpdate(data, dispatch, index, uuid);
          } else {
            return handleCreate(data, dispatch, index);
          }
      }
    };
