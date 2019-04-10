import * as React from "react";

import { SyncStatus } from "farmbot/dist";
import { SyncButtonProps } from "./interfaces";
import { sync } from "../devices/actions";
import { t } from "../i18next_wrapper";

const COLOR_MAPPING: Record<SyncStatus, string> = {
  "synced": "green",
  "sync_now": "yellow",
  "syncing": "yellow",
  "sync_error": "red",
  "booting": "gray",
  "maintenance": "gray",
  "unknown": "gray"
};

const TEXT_MAPPING: () => Record<SyncStatus, string> = () => ({
  "synced": t("SYNCED"),
  "sync_now": t("SYNC NOW"),
  "syncing": t("SYNCING"),
  "sync_error": t("SYNC ERROR"),
  "booting": t("UNKNOWN"),
  "unknown": t("UNKNOWN"),
  "maintenance": t("UNKNOWN")
});

/** Animation during syncing action */
const spinner = <span className="btn-spinner sync" />;

export function SyncButton({ bot, dispatch, consistent }: SyncButtonProps) {
  const { sync_status } = bot.hardware.informational_settings;
  const syncStatus = sync_status || "unknown";
  const normalColor = COLOR_MAPPING[syncStatus] || "gray";
  const color = (!consistent && (syncStatus === "sync_now"))
    ? "gray"
    : normalColor;
  const text = TEXT_MAPPING()[syncStatus] || syncStatus.replace("_", " ");
  const spinnerEl = (syncStatus === "syncing") ? spinner : "";

  return <button
    className={`nav-sync ${color} fb-button`}
    onClick={() => dispatch(sync())}>
    {text} {spinnerEl}
  </button>;
}
