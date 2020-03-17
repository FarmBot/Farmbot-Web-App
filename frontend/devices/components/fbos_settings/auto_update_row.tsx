import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { ColWidth } from "../farmbot_os_settings";
import { ToggleButton } from "../../../controls/toggle_button";
import { updateConfig } from "../../actions";
import { Content, DeviceSetting } from "../../../constants";
import { AutoUpdateRowProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DevSettings } from "../../../account/dev/dev_support";

export function AutoUpdateRow(props: AutoUpdateRowProps) {
  const osAutoUpdate = props.sourceFbosConfig("os_auto_update");
  const newFormat = DevSettings.futureFeaturesEnabled();
  return <Highlight settingName={DeviceSetting.farmbotOSAutoUpdate}>
    <Row>
      <Col xs={newFormat ? 9 : ColWidth.label}>
        <label>
          {t(DeviceSetting.farmbotOSAutoUpdate)}
        </label>
      </Col>
      {!newFormat &&
        <Col xs={ColWidth.description}>
          <p>
            {t(Content.OS_AUTO_UPDATE)}
          </p>
        </Col>}
      <Col xs={newFormat ? 3 : ColWidth.button}>
        <ToggleButton toggleValue={osAutoUpdate.value}
          dim={!osAutoUpdate.consistent}
          toggleAction={() => props.dispatch(updateConfig({
            os_auto_update: !osAutoUpdate.value
          }))} />
      </Col>
    </Row>
    {newFormat && <Row><p>{t(Content.OS_AUTO_UPDATE)}</p></Row>}
  </Highlight>;
}
