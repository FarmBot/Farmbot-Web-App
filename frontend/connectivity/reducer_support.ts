import { ConnectionStatus } from "./interfaces";

export function getStatus(cs: ConnectionStatus | undefined): "up" | "down" {
  return (cs && cs.state) || "down";
}
