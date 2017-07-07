import * as React from "react";
import { performSeq } from "./sequence_editor_middle_active";
import { t } from "i18next";
import { SyncStatus } from "farmbot/dist";
import { TaggedSequence } from "../resources/tagged_resources";

interface Props {
  /** Callback fired ONLY if synced. */
  onClick(): void;
  /** Callback fired is NOT synced. */
  onFail(message: string): void;
  syncStatus: SyncStatus;
  sequence: TaggedSequence;
}

export function TestButton({ onClick, onFail, syncStatus, sequence }: Props) {
  let isSynced = syncStatus === "synced";
  let isSaved = !sequence.dirty;
  let className = isSynced ? "orange" : "gray";

  let clickHandler = () => (isSynced) ?
    onClick() : onFail(t("Sync device before running."));

  return <button className={`fb-button ${className}`} onClick={onClick} >
    {t("Test")}
  </button>;
}
