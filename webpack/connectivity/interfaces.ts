import { DeviceAccountSettings } from "../devices/interfaces";
import { ResourceName } from "../resources/tagged_resources";

/** Description of a connection between two points on the network. */
export interface ConnectionStatus {
  state: "up" | "down";
  at: string;
}

export interface EdgeStatus {
  name: Edge;
  status: ConnectionStatus;
}

/** Name of a connection between two points. "." can be read as "to".
 * Example: "user.mqtt" => "User to MQTT". */
export type Edge =
  | "bot.mqtt"
  | "user.mqtt"
  | "user.api";

export interface ResourceReady {
  name: string,
  data: [DeviceAccountSettings];
}

type StatusRecord = Record<Edge, ConnectionStatus | undefined>;
/** Mapping of known connection status.
 * An `undefined` value means we don't know. */
export interface ConnectionState extends StatusRecord {
  /** Have all API requests been acknowledged by external services?
   * This flag lets us know if it is safe to do data critical tasks with the bot
   */
  consistent: boolean;
}

export interface UpdateMqttData {
  status: "UPDATE"
  kind: ResourceName;
  id: number;
  body: object;
  sessionId: string;
}

export interface DeleteMqttData {
  status: "DELETE"
  kind: ResourceName;
  id: number;
}

export interface BadMqttData {
  status: "ERR";
  reason: string;
}

export interface SkipMqttData {
  status: "SKIP";
}

export type MqttDataResult =
  | UpdateMqttData
  | DeleteMqttData
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
