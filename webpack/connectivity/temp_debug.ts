import { GetState } from "../redux/interfaces";
import { snakeCase } from "lodash";
import { getUuid } from "../resources/selectors";
import { ResourceName } from "../resources/tagged_resources";

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
  const kind = snakeCase(parts.pop()) as ResourceName | undefined;
  const { body } = JSON.parse((payload).toString()) as { body: {} | null };

  if (!kind) { return { status: "ERR", reason: Reason.BAD_KIND }; }
  if (!id) { return { status: "ERR", reason: Reason.BAD_ID }; }

  if (body) {
    return { status: "UPDATE", body, kind: kind, id };
  } else {
    return { status: "DELETE", kind: kind, id }; // 'null' body means delete.
  }
}

function handleCreate(data: UpdateMqttData) {
  console.log("INSERT");
}

function handleUpdate(data: UpdateMqttData) {
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
        case "UPDATE":
          const uuid = getUuid(getState().resources.index, data.kind, data.id);
          return (uuid ? handleCreate : handleUpdate)(data);
        case "ERR": return handleErr(data);
        case "SKIP": return handleSkip();
        case "DELETE": return handleDelete(data);
      }
    };
