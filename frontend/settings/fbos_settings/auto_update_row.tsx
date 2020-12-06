import React from "react";
import { Row, Col } from "../../ui/index";
import { ToggleButton } from "../../ui/toggle_button";
import { updateConfig } from "../../devices/actions";
import { Content, DeviceSetting } from "../../constants";
import { AutoUpdateRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export function AutoUpdateRow(props: AutoUpdateRowProps) {
  const osAutoUpdate = props.sourceFbosConfig("os_auto_update");
  return <Highlight settingName={DeviceSetting.osAutoUpdate}>
    <Row>
      <Col xs={9}>
        <label>
          {t(DeviceSetting.osAutoUpdate)}
        </label>
      </Col>
      <Col xs={3}>
        <ToggleButton toggleValue={osAutoUpdate.value}
          dim={!osAutoUpdate.consistent}
          toggleAction={() => props.dispatch(updateConfig({
            os_auto_update: !osAutoUpdate.value
          }))} />
      </Col>
    </Row>
    <Row><p>{t(Content.OS_AUTO_UPDATE)}</p></Row>
  </Highlight>;
}
