import { TaggedResource } from "farmbot";

export type NetworkState = "up" | "down";

/** Description of a connection between two points on the network. */
export interface ConnectionStatus {
  state: NetworkState;
  at: number;
}

export interface EdgeStatus {
  name: Edge;
  status: ConnectionStatus;
  why: string;
}

/** Name of a connection between two points. "." can be read as "to".
 * Example: "user.mqtt" => "User to MQTT". */
export type Edge =
  | "bot.mqtt"
  | "user.mqtt"
  | "user.api";

type ConnectionRecord = Record<Edge, ConnectionStatus | undefined>;

/** Mapping of known connection status.
 * An `undefined` value means we don't know. */
export type ConnectionState = {
  uptime: ConnectionRecord;
  pings: {}
};

export interface UpdateMqttData<T extends TaggedResource> {
  status: "UPDATE"
  kind: T["kind"];
  body: T["body"];
  id: number;
  sessionId: string;
}

export interface DeleteMqttData<T extends TaggedResource> {
  status: "DELETE"
  kind: T["kind"];
  id: number;
}

export interface BadMqttData {
  status: "ERR";
  reason: string;
}

export interface SkipMqttData {
  status: "SKIP";
}

export type MqttDataResult<T extends TaggedResource> =
  | UpdateMqttData<T>
  | DeleteMqttData<T>
  | SkipMqttData
  | BadMqttData;

export enum Reason {
  BAD_KIND = "missing `kind`",
  BAD_ID = "No ID or invalid ID.",
  BAD_CHAN = "Expected exactly 5 segments in channel"
}

export interface SyncPayload {
  args: { label: string; };
  body: object | undefined;
}
