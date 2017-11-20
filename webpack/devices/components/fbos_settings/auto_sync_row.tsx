import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { ToggleButton } from "../../../controls/toggle_button";
import { Content } from "../../../constants";
import { updateConfig } from "../../actions";
import { noop } from "lodash";
import { getDevice } from "../../../device";

interface AutoSyncRowProps { currentValue: boolean; }

export function AutoSyncRow(props: AutoSyncRowProps) {
  const auto_sync = !props.currentValue;
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
      <ToggleButton toggleValue={props.currentValue}
        toggleAction={() => {
          updateConfig({ auto_sync })(noop);
          getDevice().sync();
        }} />
    </Col>
  </Row>;
}
