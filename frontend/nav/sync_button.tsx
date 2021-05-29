import React from "react";
import { SyncStatus } from "farmbot/dist";
import { SyncButtonProps } from "./interfaces";
import { sync } from "../devices/actions";
import { t } from "../i18next_wrapper";
import { forceOnline } from "../devices/must_be_online";

const TEXT_MAPPING = (): Record<SyncStatus, string> => ({
  synced: t("Synced"),
  sync_now: t("Syncing..."),
  syncing: t("Syncing..."),
  sync_error: t("Sync error"),
  booting: t("Sync unknown"),
  unknown: t("Sync unknown"),
  maintenance: t("Sync unknown"),
});

/** Animation during syncing action */
const spinner = <span className="btn-spinner sync" />;

export function SyncButton(props: SyncButtonProps) {
  const { bot, dispatch } = props;
  const { sync_status } = bot.hardware.informational_settings;
  const syncStatus = forceOnline() ? "synced" : sync_status || "unknown";
  const text = TEXT_MAPPING()[syncStatus] || syncStatus.replace("_", " ");
  const spinnerEl = (syncStatus === "syncing") ? spinner : "";
  const className = `nav-sync fb-button ${syncStatus} ${bot.consistent ? "c" : ""}`;

  return <button
    className={className}
    title={t("sync")}
    onClick={() => dispatch(sync())}>
    {text} {spinnerEl}
  </button>;
}
