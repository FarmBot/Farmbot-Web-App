import * as React from "react";
import { DangerZoneProps } from "../interfaces";
import { Row, Col } from "../../../ui/index";
import { Header } from "./header";
import { Collapse, Popover, Position } from "@blueprintjs/core";
import { Content, DeviceSetting } from "../../../constants";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DevSettings } from "../../../account/dev/dev_support";
import { SettingLoadProgress } from "../hardware_settings";
import { FwParamExportMenu } from "./export_menu";

export function DangerZone(props: DangerZoneProps) {

  const { dispatch, onReset, botOnline, arduinoBusy, firmwareHardware } = props;
  const { danger_zone } = props.controlPanelState;
  const newFormat = DevSettings.futureFeature1Enabled();
  return <Highlight className={"section"}
    settingName={DeviceSetting.dangerZone}>
    <Header
      expanded={danger_zone}
      title={DeviceSetting.dangerZone}
      panel={"danger_zone"}
      dispatch={dispatch} />
    <Collapse isOpen={!!danger_zone}>
      {newFormat &&
        <Highlight settingName={DeviceSetting.paramLoadProgress}>
          <Row>
            <Col xs={7}>
              <label style={{ lineHeight: "1.5rem" }}>
                {t(DeviceSetting.paramLoadProgress)}
              </label>
            </Col>
            <Col xs={5} className={"centered-button-div"}>
              <SettingLoadProgress firmwareHardware={firmwareHardware}
                firmwareConfig={props.firmwareConfig}
                sourceFwConfig={props.sourceFwConfig} />
            </Col>
          </Row>
        </Highlight>}
      {newFormat &&
        <Highlight settingName={DeviceSetting.exportParameters}>
          <Row>
            <Col xs={7}>
              <label style={{ lineHeight: "1.5rem" }}>
                {t(DeviceSetting.exportParameters)}
              </label>
            </Col>
            <Col xs={5} className={"centered-button-div"}>
              <Popover position={Position.BOTTOM_RIGHT}>
                <i className="fa fa-download" />
                <FwParamExportMenu firmwareConfig={props.firmwareConfig} />
              </Popover>
            </Col>
          </Row>
        </Highlight>}
      <Highlight settingName={DeviceSetting.resetHardwareParams}>
        <Row>
          <Col xs={newFormat ? 8 : 4}>
            <label style={{ lineHeight: "1.5rem" }}>
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
              disabled={arduinoBusy || !botOnline}
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
