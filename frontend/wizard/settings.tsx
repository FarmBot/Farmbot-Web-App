import React from "react";
import { t } from "../i18next_wrapper";
import { Row, Col } from "../ui";
import { WizardData } from "./data";

export const SetupWizardSettings = () =>
  <div className={"setup-settings"}>
    <Row />
    <Row />
    <Row>
      <Col xs={8}>
        <label>
          {t("Restart setup wizard")}
        </label>
      </Col>
      <Col xs={4}>
        <button className={"fb-button red"} onClick={WizardData.reset}>
          {t("restart")}
        </button>
      </Col>
    </Row>
    <Row>
      <Col xs={8}>
        <label>
          {t("Complete setup wizard")}
        </label>
      </Col>
      <Col xs={4}>
        <button className={"fb-button green"} onClick={WizardData.setComplete}>
          {t("complete")}
        </button>
      </Col>
    </Row>
  </div>;
