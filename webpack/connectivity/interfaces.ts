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
export type Edge = "user.mqtt" | "user.api";

/** Mapping of known connection status.
 * An `undefined` value means we don't know. */
export type ConnectionState = Record<Edge, ConnectionStatus | undefined>;
