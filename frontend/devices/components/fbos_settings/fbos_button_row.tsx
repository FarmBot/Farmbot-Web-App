import * as React from "react";
import { Row, Col } from "../../../ui";
import { ColWidth } from "../farmbot_os_settings";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../../constants";

export interface FbosButtonRowProps {
  botOnline: boolean;
  label: DeviceSetting;
  description: string;
  buttonText: string;
  color: string;
  action: () => void;
}

export const FbosButtonRow = (props: FbosButtonRowProps) => {
  return <Row>
    <Highlight settingName={props.label}>
      <Col xs={ColWidth.label}>
        <label>
          {t(props.label)}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <p>
          {t(props.description)}
        </p>
      </Col>
      <Col xs={ColWidth.button}>
        <button
          className={`fb-button ${props.color}`}
          type="button"
          onClick={props.action}
          disabled={!props.botOnline}>
          {t(props.buttonText)}
        </button>
      </Col>
    </Highlight>
  </Row>;
};
