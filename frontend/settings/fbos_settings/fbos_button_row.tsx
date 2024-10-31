import React from "react";
import { Row, Help } from "../../ui";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";

export interface FbosButtonRowProps {
  botOnline: boolean;
  label: DeviceSetting;
  description: string;
  buttonText: string;
  color: string;
  advanced?: boolean;
  showAdvanced?: boolean;
  action: () => void;
}

export const FbosButtonRow = (props: FbosButtonRowProps) => {
  return <Highlight settingName={props.label}
    hidden={props.advanced && !props.showAdvanced}
    className={props.advanced ? "advanced" : ""}>
    <Row className="grid-exp-1">
      <div>
        <label>
          {t(props.label)}
        </label>
        <Help text={props.description} />
      </div>
      <button
        className={`fb-button ${props.color}`}
        type="button"
        onClick={props.action}
        title={t(props.buttonText)}
        disabled={!props.botOnline}>
        {t(props.buttonText)}
      </button>
    </Row>
  </Highlight>;
};
