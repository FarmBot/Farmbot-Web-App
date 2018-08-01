import * as React from "react";
import { t } from "i18next";
import { SyncStatus } from "farmbot/dist";
import { TaggedSequence } from "farmbot";

export interface TestBtnProps {
  /** Callback fired ONLY if synced. */
  onClick(): void;
  /** Callback fired is NOT synced. */
  onFail(message: string): void;
  syncStatus: SyncStatus;
  sequence: TaggedSequence;
}

export function TestButton({ onClick, onFail, syncStatus, sequence }: TestBtnProps) {
  const isSynced = syncStatus === "synced";
  const isSaved = !sequence.specialStatus;
  const canTest = isSynced && isSaved;
  const className = canTest ? "orange" : "pseudo-disabled";

  const clickHandler = () => (canTest) ?
    onClick() : onFail(t("Save sequence and sync device before running."));

  return <button className={`fb-button ${className}`} onClick={clickHandler} >
    {t("Test")}
  </button>;
}
