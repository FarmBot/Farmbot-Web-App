import * as React from "react";
import { SyncStatus } from "farmbot/dist";
import { SyncButtonProps } from "./interfaces";
import { sync } from "../devices/actions";
import { t } from "../i18next_wrapper";

const GRAY = "pseudo-disabled";

const COLOR_MAPPING: Record<SyncStatus, string> = {
  "synced": "green",
  "sync_now": "yellow",
  "syncing": "yellow",
  "sync_error": "red",
  "booting": GRAY,
  "maintenance": GRAY,
  "unknown": GRAY
};

const TEXT_MAPPING = (autoSync: boolean): Record<SyncStatus, string> => ({
  "synced": autoSync ? t("Synced") : t("SYNCED"),
  "sync_now": autoSync ? t("Syncing...") : t("SYNC NOW"),
  "syncing": autoSync ? t("Syncing...") : t("SYNCING"),
  "sync_error": autoSync ? t("Sync error") : t("SYNC ERROR"),
  "booting": autoSync ? t("Sync unknown") : t("UNKNOWN"),
  "unknown": autoSync ? t("Sync unknown") : t("UNKNOWN"),
  "maintenance": autoSync ? t("Sync unknown") : t("UNKNOWN")
});

/** Animation during syncing action */
const spinner = <span className="btn-spinner sync" />;

export function SyncButton(props: SyncButtonProps) {
  const { bot, dispatch, consistent, autoSync } = props;
  const { sync_status } = bot.hardware.informational_settings;
  const syncStatus = sync_status || "unknown";
  const normalColor = COLOR_MAPPING[syncStatus] || GRAY;
  const color = (!consistent && (syncStatus === "sync_now"))
    ? GRAY
    : normalColor;
  const text = TEXT_MAPPING(autoSync)[syncStatus] || syncStatus.replace("_", " ");
  const spinnerEl = (syncStatus === "syncing") ? spinner : "";
  const autoSyncfront = (syncStatus === "syncing") ? "auto-sync-busy" : "auto-sync";
  const className = autoSync
    ? `nav-sync fb-button ${autoSyncfront}`
    : `nav-sync ${color} fb-button`;

  return <button
    className={className}
    onClick={() => dispatch(sync())}>
    {text} {spinnerEl}
  </button>;
}
