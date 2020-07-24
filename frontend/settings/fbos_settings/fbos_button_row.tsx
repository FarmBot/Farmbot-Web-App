import * as React from "react";
import { Row, Col } from "../../ui";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";

export interface FbosButtonRowProps {
  botOnline: boolean;
  label: DeviceSetting;
  description: string;
  buttonText: string;
  color: string;
  action: () => void;
}

export const FbosButtonRow = (props: FbosButtonRowProps) => {
  return <Highlight settingName={props.label}>
    <Row>
      <Col xs={7}>
        <label>
          {t(props.label)}
        </label>
      </Col>
      <Col xs={5}>
        <button
          className={`fb-button ${props.color}`}
          type="button"
          onClick={props.action}
          title={t(props.buttonText)}
          disabled={!props.botOnline}>
          {t(props.buttonText)}
        </button>
      </Col>
    </Row>
    <Row><p>{t(props.description)}</p></Row>
  </Highlight>;
};
