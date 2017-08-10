import * as React from "react";
import { t } from "i18next";

/** The bottom half of the regimen editor panel (when no Regimen is selected). */
export function EmptyEditor({ }: {}) {
  return <p>{t(`No Regimen selected. Click one in the Regimens
        panel to edit, or click "+" in the Regimens panel to create a new one.`)}</p>;
}
