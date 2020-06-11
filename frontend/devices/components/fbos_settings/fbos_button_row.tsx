import * as React from "react";
import { Row, Col } from "../../../ui";
import { ColWidth } from "../farmbot_os_settings";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../../constants";
import { DevSettings } from "../../../account/dev/dev_support";

export interface FbosButtonRowProps {
  botOnline: boolean;
  label: DeviceSetting;
  description: string;
  buttonText: string;
  color: string;
  action: () => void;
}

export const FbosButtonRow = (props: FbosButtonRowProps) => {
  const newFormat = DevSettings.futureFeature1Enabled();
  return <Highlight settingName={props.label}>
    <Row>
      <Col xs={newFormat ? 7 : ColWidth.label}>
        <label>
          {t(props.label)}
        </label>
      </Col>
      {!newFormat &&
        <Col xs={ColWidth.description}>
          <p>
            {t(props.description)}
          </p>
        </Col>}
      <Col xs={newFormat ? 5 : ColWidth.button}>
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
    {newFormat && <Row><p>{t(props.description)}</p></Row>}
  </Highlight>;
};
