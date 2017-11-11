import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { OsUpdateButton } from "./os_update_button";
import { BotState } from "../../interfaces";

interface AutoUpdateRowProps {
  controller_version: string | undefined;
  bot: BotState;
}

export function AutoUpdateRow(props: AutoUpdateRowProps) {
  const version = props.controller_version || t(" unknown (offline)");
  return <Row>
    <Col xs={2}>
      <label>
        {t("FARMBOT OS")}
      </label>
    </Col>
    <Col xs={3}>
      <p>
        {t("Version {{ version }}", { version })}
      </p>
    </Col>
    <Col xs={7}>
      <OsUpdateButton bot={props.bot} />
    </Col>
  </Row>;
}
