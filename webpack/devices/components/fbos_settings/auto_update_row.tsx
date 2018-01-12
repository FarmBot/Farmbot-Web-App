import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { BotState } from "../../interfaces";
import { ColWidth } from "../farmbot_os_settings";
import { ToggleButton } from "../../../controls/toggle_button";
import { updateConfig } from "../../actions";
import { noop } from "lodash";
import { Content } from "../../../constants";

interface AutoUpdateRowProps {
  bot: BotState;
}

export function AutoUpdateRow(props: AutoUpdateRowProps) {
  const { os_auto_update } = props.bot.hardware.configuration;
  return <Row>
    <Col xs={ColWidth.label}>
      <label>
        {t("FARMBOT OS AUTO UPDATE")}
      </label>
    </Col>
    <Col xs={ColWidth.description}>
      <p>
        {t(Content.OS_AUTO_UPDATE)}
      </p>
    </Col>
    <Col xs={ColWidth.button}>
      <ToggleButton toggleValue={os_auto_update}
        toggleAction={() => {
          const newOsAutoUpdateNum = !os_auto_update ? 1 : 0;
          updateConfig({ os_auto_update: newOsAutoUpdateNum })(noop);
        }} />
    </Col>
  </Row>;
}
