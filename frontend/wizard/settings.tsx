import React from "react";
import { t } from "../i18next_wrapper";
import { Row, Col } from "../ui";
import {
  completeSetup, destroyAllWizardStepResults, resetSetup,
} from "./actions";
import { SetupWizardSettingsProps } from "./interfaces";

export const SetupWizardSettings = (props: SetupWizardSettingsProps) =>
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
        <button className={"fb-button red"} onClick={() => {
          props.dispatch(destroyAllWizardStepResults(
            props.wizardStepResults));
          props.dispatch(resetSetup(props.device));
        }}>
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
        <button className={"fb-button green"} onClick={() =>
          props.dispatch(completeSetup(props.device))}>
          {t("complete")}
        </button>
      </Col>
    </Row>
  </div>;
