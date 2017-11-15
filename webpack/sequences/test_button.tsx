import * as React from "react";
import { t } from "i18next";
import { SyncStatus } from "farmbot/dist";
import { TaggedSequence } from "../resources/tagged_resources";

export interface TestBtnProps {
  /** Callback fired ONLY if synced. */
  onClick(): void;
  /** Callback fired is NOT synced. */
  onFail(message: string): void;
  syncStatus: SyncStatus;
  /** Are there uncommited data operations that need broadcasted to other
   * entities on the network? */
  consistent: boolean;
  autoSyncEnabled: boolean;
  sequence: TaggedSequence;
}

export function TestButton(p: TestBtnProps) {
  const {
    onClick,
    onFail,
    syncStatus,
    sequence,
    autoSyncEnabled,
    consistent
  } = p;
  const isSynced = syncStatus === "synced";
  const isSaved = !sequence.specialStatus;
  const canTest = (isSynced && isSaved) && (autoSyncEnabled && !consistent);
  const className = canTest ? "orange" : "gray";

  const clickHandler = () => (canTest) ?
    onClick() : onFail(t("Save sequence and sync device before running."));

  return <button className={`fb-button ${className}`} onClick={clickHandler} >
    {t("Test")}
  </button>;
}
