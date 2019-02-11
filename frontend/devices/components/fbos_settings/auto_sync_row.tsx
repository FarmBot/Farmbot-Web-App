import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { ToggleButton } from "../../../controls/toggle_button";
import { Content } from "../../../constants";
import { updateConfig } from "../../actions";
import { ColWidth } from "../farmbot_os_settings";
import { AutoSyncRowProps } from "./interfaces";

export function AutoSyncRow(props: AutoSyncRowProps) {
  const autoSync = props.sourceFbosConfig("auto_sync");
  return <Row>
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
  </Row>;
}
