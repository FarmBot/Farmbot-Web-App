import * as React from "react";
import { DangerZoneProps } from "../interfaces";
import { Row, Col } from "../../../ui/index";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { Content, DeviceSetting } from "../../../constants";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DevSettings } from "../../../account/dev/dev_support";

export function DangerZone(props: DangerZoneProps) {

  const { dispatch, onReset, botOnline } = props;
  const { danger_zone } = props.controlPanelState;
  const newFormat = DevSettings.futureFeaturesEnabled();
  return <Highlight className={"section"}
    settingName={DeviceSetting.dangerZone}>
    <Header
      expanded={danger_zone}
      title={DeviceSetting.dangerZone}
      panel={"danger_zone"}
      dispatch={dispatch} />
    <Collapse isOpen={!!danger_zone}>
      <Highlight settingName={DeviceSetting.resetHardwareParams}>
        <Row>
          <Col xs={newFormat ? 8 : 4}>
            <label>
              {t(DeviceSetting.resetHardwareParams)}
            </label>
          </Col>
          {!newFormat &&
            <Col xs={6}>
              <p>
                {t(Content.RESTORE_DEFAULT_HARDWARE_SETTINGS)}
              </p>
            </Col>}
          <Col xs={newFormat ? 4 : 2} className={"centered-button-div"}>
            <button
              className="fb-button red"
              disabled={!botOnline}
              title={t("RESET")}
              onClick={onReset}>
              {t("RESET")}
            </button>
          </Col>
        </Row>
        {newFormat &&
          <Row><p>{t(Content.RESTORE_DEFAULT_HARDWARE_SETTINGS)}</p></Row>}
      </Highlight>
    </Collapse>
  </Highlight>;
}
