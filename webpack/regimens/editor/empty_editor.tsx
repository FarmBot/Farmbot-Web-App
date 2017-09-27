import * as React from "react";
import { t } from "i18next";
import { Content } from "../../constants";

/** The bottom half of the regimen editor panel (when no Regimen is selected). */
export function EmptyEditor({ }: {}) {
  return <div>
    <p>
      {t(Content.NO_REGIMEN_SELECTED)}
    </p>
    <img
      className="empty-state-graphic"
      src="/app-resources/img/empty-state-regimen.svg" />
  </div>;
}
