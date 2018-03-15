import * as React from "react";
import { t } from "i18next";
import { SyncStatus } from "farmbot/dist";
import { NavButtonProps } from "./interfaces";
import { sync } from "../devices/actions";

const COLOR_MAPPING: Record<SyncStatus, string> = {
  "synced": "green",
  "sync_now": "yellow",
  "syncing": "yellow",
  "sync_error": "red",
  "booting": "yellow",
  "maintenance": "yellow",
  "unknown": "red"
};

const TEXT_MAPPING: Record<SyncStatus, string> = {
  "synced": "SYNCED",
  "sync_now": "SYNC NOW",
  "syncing": "SYNCING",
  "sync_error": "SYNC ERROR",
  "booting": "BOOTING",
  "unknown": "DISCONNECTED",
  "maintenance": "MAINTENANCE DOWNTIME"
};

/** Animation during saving action */
const spinner = <span className="btn-spinner sync" />;

export function SyncButton({ user, bot, dispatch, consistent }: NavButtonProps) {
  if (!user) {
    return <span></span>;
  }
  let { sync_status } = bot.hardware.informational_settings;
  sync_status = sync_status || "unknown";
  const color = consistent ? (COLOR_MAPPING[sync_status] || "red") : "gray";
  const text = t(TEXT_MAPPING[sync_status] || "DISCONNECTED");
  const spinnerEl = (sync_status === "syncing") ? spinner : "";

  return <button
    className={`nav-sync ${color} fb-button`}
    onClick={() => dispatch(sync())}>
    {text} {spinnerEl}
  </button>;
}
