import * as React from "react";
import { DangerZoneProps } from "../interfaces";
import { Row, Col } from "../../../ui/index";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { Content, DeviceSetting } from "../../../constants";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export function DangerZone(props: DangerZoneProps) {

  const { dispatch, onReset, botDisconnected } = props;
  const { danger_zone } = props.controlPanelState;

  return <Highlight className={"section"}
    settingName={DeviceSetting.dangerZone}>
    <Header
      expanded={danger_zone}
      title={DeviceSetting.dangerZone}
      panel={"danger_zone"}
      dispatch={dispatch} />
    <Collapse isOpen={!!danger_zone}>
      <Row>
        <Highlight settingName={DeviceSetting.resetHardwareParams}>
          <Col xs={4}>
            <label>
              {t(DeviceSetting.resetHardwareParams)}
            </label>
          </Col>
          <Col xs={6}>
            <p>
              {t(Content.RESTORE_DEFAULT_HARDWARE_SETTINGS)}
            </p>
          </Col>
          <Col xs={2} className={"centered-button-div"}>
            <button
              className="fb-button red"
              disabled={botDisconnected}
              onClick={onReset}>
              {t("RESET")}
            </button>
          </Col>
        </Highlight>
      </Row>
    </Collapse>
  </Highlight>;
}
