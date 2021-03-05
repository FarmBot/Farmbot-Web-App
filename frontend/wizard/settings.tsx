import React from "react";
import { t } from "../i18next_wrapper";
import { Row, Col } from "../ui";
import { destroyAllWizardStepResults } from "./actions";
import { WizardData } from "./data";
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
          WizardData.reset();
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
        <button className={"fb-button green"} onClick={WizardData.setComplete}>
          {t("complete")}
        </button>
      </Col>
    </Row>
  </div>;
