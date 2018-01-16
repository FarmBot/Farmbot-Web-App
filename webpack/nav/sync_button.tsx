import * as React from "react";
import { SyncStatus } from "farmbot/dist";
import { NavButtonProps } from "./interfaces";
import { sync } from "../devices/actions";
import { ConnectionStatus } from "../connectivity/interfaces";
import { fancyDebug } from "../util";

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
  const x: CalculationProps = fancyDebug({
    sync_status: bot.hardware.informational_settings.sync_status,
    mqttToBot: bot.connectivity["bot.mqtt"],
    consistent
  });
  /** WHY DO WE TRACK ONLINE STATUS IN THE SYNC BUTTON?
   * When the device is offline, there might be old state floating around.
   * By checking bot.connectivity["bot.mqtt"] first, we can know if it is safe
   * to ignore the current sync_status.
   */

  // const text = online ? TEXT_MAPPING[sync_status] : undefined;
  return (
    <button
      className={`nav-sync ${calculateColor(x)} fb-button`}
      onClick={() => dispatch(sync())}>
      {calculateText(x)}
    </button>
  );
}

interface CalculationProps {
  sync_status: SyncStatus | undefined;
  mqttToBot: ConnectionStatus | undefined;
  consistent: boolean;
}

function calculateColor(x: CalculationProps) {
  const { mqttToBot, consistent, sync_status } = x;
  const online = mqttToBot && mqttToBot.state === "up";
  const color = COLOR_MAPPING[sync_status || "unknown"];
  return (!consistent || !online) ? "gray" : color;
}

function calculateText(x: CalculationProps) {
  const { mqttToBot, sync_status } = x;
  const online = mqttToBot && mqttToBot.state === "up";
  if (online && sync_status) {
    return TEXT_MAPPING[sync_status] || TEXT_MAPPING.unknown;
  } else {
    return TEXT_MAPPING.unknown;
  }
}
