import { SyncStatus } from "farmbot";
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

export const syncText = (syncStatus: SyncStatus) => {
  const status = forceOnline() ? "synced" : syncStatus || "unknown";
  const text = TEXT_MAPPING()[status] || status.replace("_", " ");
  return text;
};
