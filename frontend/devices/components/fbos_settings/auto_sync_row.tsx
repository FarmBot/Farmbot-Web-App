import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { ToggleButton } from "../../../controls/toggle_button";
import { Content, DeviceSetting } from "../../../constants";
import { updateConfig } from "../../actions";
import { ColWidth } from "../farmbot_os_settings";
import { AutoSyncRowProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DevSettings } from "../../../account/dev/dev_support";

export function AutoSyncRow(props: AutoSyncRowProps) {
  const autoSync = props.sourceFbosConfig("auto_sync");
  const newFormat = DevSettings.futureFeature1Enabled();
  return <Highlight settingName={DeviceSetting.autoSync}>
    <Row>
      <Col xs={newFormat ? 9 : ColWidth.label}>
        <label>
          {t("AUTO SYNC")}
        </label>
      </Col>
      {!newFormat &&
        <Col xs={ColWidth.description}>
          <p>
            {t(Content.AUTO_SYNC)}
          </p>
        </Col>}
      <Col xs={newFormat ? 3 : ColWidth.button}>
        <ToggleButton
          toggleValue={autoSync.value}
          dim={!autoSync.consistent}
          toggleAction={() => {
            props.dispatch(updateConfig({ auto_sync: !autoSync.value }));
          }} />
      </Col>
    </Row>
    {newFormat && <Row><p>{t(Content.AUTO_SYNC)}</p></Row>}
  </Highlight>;
}
