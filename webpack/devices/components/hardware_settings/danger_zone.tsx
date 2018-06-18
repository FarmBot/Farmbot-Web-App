import * as React from "react";
import { t } from "i18next";
import { DangerZoneProps } from "../interfaces";
import { Row, Col } from "../../../ui/index";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { Content } from "../../../constants";

export function DangerZone(props: DangerZoneProps) {

  const { dispatch, onReset, botDisconnected } = props;
  const { danger_zone } = props.controlPanelState;

  return <section>
    <Header
      expanded={danger_zone}
      title={t("Danger Zone")}
      name={"danger_zone"}
      dispatch={dispatch} />
    <Collapse isOpen={!!danger_zone}>
      <Row>
        <Col xs={4}>
          <label>
            {t("Reset hardware parameter defaults")}
          </label>
        </Col>
        <Col xs={6}>
          <p>
            {t(Content.RESTORE_DEFAULT_HARDWARE_SETTINGS)}
          </p>
        </Col>
        <Col xs={2} className={"centered-button-div"}>
          <button
            className="fb-button red"
            disabled={botDisconnected}
            onClick={onReset}>
            {t("RESET")}
          </button>
        </Col>
      </Row>
    </Collapse>
  </section>;
}
