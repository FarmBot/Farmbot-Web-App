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
  "synced": t("SYNCED"),
  "sync_now": t("SYNC NOW"),
  "syncing": t("SYNCING"),
  "sync_error": t("SYNC ERROR"),
  "booting": t("BOOTING"),
  "unknown": t("DISCONNECTED"),
  "maintenance": t("MAINTENANCE DOWNTIME")
};

/** Animation during syncing action */
const spinner = <span className="btn-spinner sync" />;

export function SyncButton({ user, bot, dispatch, consistent }: NavButtonProps) {

  if (!user) {
    return <span></span>;
  }
  let { sync_status } = bot.hardware.informational_settings;
  sync_status = sync_status || "unknown";
  const color = !consistent && sync_status === "sync_now"
    ? "gray"
    : (COLOR_MAPPING[sync_status] || "red");
  const text = TEXT_MAPPING[sync_status] || t("DISCONNECTED");
  const spinnerEl = (sync_status === "syncing") ? spinner : "";

  return <button
    className={`nav-sync ${color} fb-button`}
    onClick={() => dispatch(sync())}>
    {text} {spinnerEl}
  </button>;
}
