import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { ToggleButton } from "../../../controls/toggle_button";
import { Content } from "../../../constants";
import { updateConfig } from "../../actions";
import { noop } from "lodash";

interface AutoSyncRowProps { currentValue: number | undefined; }

export function AutoSyncRow(props: AutoSyncRowProps) {
  const auto_sync = props.currentValue === 1 ? 0 : 1;
  return <Row>
    <Col xs={2}>
      <label>
        {t("AUTO SYNC")}
      </label>
    </Col>
    <Col xs={7}>
      <p>
        {t(Content.AUTO_SYNC)}
      </p>
    </Col>
    <Col xs={3}>
      <ToggleButton toggleValue={props.currentValue || 0}
        toggleAction={() => {
          updateConfig({ auto_sync })(noop);
        }} />
    </Col>
  </Row>;
}
