import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { ToggleButton } from "../../../controls/toggle_button";
import { Content, DeviceSetting } from "../../../constants";
import { updateConfig } from "../../actions";
import { ColWidth } from "../farmbot_os_settings";
import { AutoSyncRowProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export function AutoSyncRow(props: AutoSyncRowProps) {
  const autoSync = props.sourceFbosConfig("auto_sync");
  return <Row>
    <Highlight settingName={DeviceSetting.autoSync}>
      <Col xs={ColWidth.label}>
        <label>
          {t("AUTO SYNC")}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <p>
          {t(Content.AUTO_SYNC)}
        </p>
      </Col>
      <Col xs={ColWidth.button}>
        <ToggleButton
          toggleValue={autoSync.value}
          dim={!autoSync.consistent}
          toggleAction={() => {
            props.dispatch(updateConfig({ auto_sync: !autoSync.value }));
          }} />
      </Col>
    </Highlight>
  </Row>;
}
