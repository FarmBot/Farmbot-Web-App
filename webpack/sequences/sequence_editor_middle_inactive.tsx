import * as React from "react";
import { t } from "i18next";
import { Content } from "../constants";

/** The bottom half of the Sequence editor panel (when no Sequence is selected). */
export function SequenceEditorMiddleInactive({ }: {}) {
  return <p>{t(Content.NO_SEQUENCE_SELECTED)}</p>;
}
