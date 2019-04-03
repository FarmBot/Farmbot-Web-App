import * as React from "react";
import { t } from "../../i18next_wrapper";

interface SPTTProps {
  tooltip?: string | undefined;
}

export function SpacePanelToolTip({ tooltip }: SPTTProps) {
  return (tooltip && <div className="help">
    <i className="fa fa-question-circle help-icon" />
    <div className="help-text">
      {t(tooltip)}
    </div>
  </div>) || <span />;
}
