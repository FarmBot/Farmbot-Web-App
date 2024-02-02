import React from "react";
import { Row, Col, Help, ToggleButton } from "../../ui";
import { updateConfig } from "../../devices/actions";
import { Content, DeviceSetting } from "../../constants";
import { AutoUpdateRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { getModifiedClassName } from "./default_values";
import { validFirmwareHardware } from "../firmware/firmware_hardware_support";

export function AutoUpdateRow(props: AutoUpdateRowProps) {
  const osAutoUpdate = props.sourceFbosConfig("os_auto_update");
  const firmwareHardware = validFirmwareHardware(
    props.sourceFbosConfig("firmware_hardware").value);
  return <Highlight settingName={DeviceSetting.osAutoUpdate} hidden={true}>
    <Row>
      <Col xs={9}>
        <label>
          {t(DeviceSetting.osAutoUpdate)}
        </label>
        <Help text={Content.OS_AUTO_UPDATE} />
      </Col>
      <Col xs={3}>
        <ToggleButton
          toggleValue={osAutoUpdate.value}
          dim={!osAutoUpdate.consistent}
          className={getModifiedClassName("os_auto_update",
            !!osAutoUpdate.value, firmwareHardware)}
          toggleAction={() => props.dispatch(updateConfig({
            os_auto_update: !osAutoUpdate.value
          }))} />
      </Col>
    </Row>
  </Highlight>;
}
