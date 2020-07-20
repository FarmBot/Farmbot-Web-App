import * as React from "react";
import { Row, Col } from "../../ui/index";
import { ToggleButton } from "../../controls/toggle_button";
import { Content, DeviceSetting } from "../../constants";
import { updateConfig } from "../../devices/actions";
import { AutoSyncRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export function AutoSyncRow(props: AutoSyncRowProps) {
  const autoSync = props.sourceFbosConfig("auto_sync");
  return <Highlight settingName={DeviceSetting.autoSync}
    hidden={!!autoSync.value}>
    <Row>
      <Col xs={9}>
        <label>
          {t("AUTO SYNC")}
        </label>
      </Col>
      <Col xs={3}>
        <ToggleButton
          toggleValue={autoSync.value}
          dim={!autoSync.consistent}
          toggleAction={() =>
            (!autoSync.value || confirm(t(Content.DISABLE_AUTO_SYNC))) &&
            props.dispatch(updateConfig({ auto_sync: !autoSync.value }))} />
      </Col>
    </Row>
    <Row><p>{t(Content.AUTO_SYNC)}</p></Row>
  </Highlight>;
}
