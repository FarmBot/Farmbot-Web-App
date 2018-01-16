import * as React from "react";
import { SyncStatus } from "farmbot/dist";
import { NavButtonProps } from "./interfaces";
import { sync } from "../devices/actions";

const COLOR_MAPPING: Record<SyncStatus, string> = {
  "synced": "green",
  "sync_now": "yellow",
  "syncing": "yellow",
  "sync_error": "red",
  "locked": "red",
  "maintenance": "yellow",
  "unknown": "red"
};

const TEXT_MAPPING: Record<SyncStatus, string> = {
  "synced": "SYNCED",
  "sync_now": "SYNC NOW",
  "syncing": "SYNCING",
  "sync_error": "SYNC ERROR",
  "locked": "LOCKED",
  "unknown": "DISCONNECTED",
  "maintenance": "MAINTENANCE DOWNTIME"
};

export function SyncButton({ user, bot, dispatch, consistent }: NavButtonProps) {
  if (!user) {
    return <span></span>;
  }
  let { sync_status } = bot.hardware.informational_settings;
  sync_status = sync_status || "unknown";
  /** WHY DO WE TRACK ONLINE STATUS IN THE SYNC BUTTON?
   * When the device is offline, there might be old state floating around.
   * By checking bot.connectivity["bot.mqtt"] first, we can know if it is safe
   * to ignore the current sync_status.
   */
  const x = bot.connectivity["bot.mqtt"];
  const online = x && x.state === "up";
  const color =
    (consistent && online) ? (COLOR_MAPPING[sync_status] || "red") : "gray";
  const text = online ? TEXT_MAPPING[sync_status] : undefined;
  return (
    <button
      className={`nav-sync ${color} fb-button`}
      onClick={() => dispatch(sync())}>
      {text || TEXT_MAPPING.unknown}
    </button>
  );
}
