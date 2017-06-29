import * as React from "react";

interface SPTTProps {
  tooltip?: string | undefined;
}

export function SpacePanelToolTip({ tooltip }: SPTTProps) {
  return (tooltip && <div className="help">
    <i className="fa fa-question-circle help-icon" />
    <div className="help-text">
      {tooltip}
    </div>
  </div>) || <span />;
}
