import * as React from "react";
import { t } from "i18next";

/** The bottom half of the Sequence editor panel (when no Sequence is selected). */
export function SequenceEditorMiddleInactive({ }: {}) {
  return <p>{t(`No Sequence selected. Click one in the Sequences
        panel to edit, or click "+" to create a new one.`)}</p>;
}
