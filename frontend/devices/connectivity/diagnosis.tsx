import * as React from "react";
import { DiagnosticMessages } from "../../constants";
import { Col, Row, docLink } from "../../ui/index";
import { bitArray } from "../../util";
import { TRUTH_TABLE } from "./truth_table";
import { t } from "../../i18next_wrapper";

export type DiagnosisName =
  | "userAPI"
  | "userMQTT"
  | "botMQTT"
  | "botAPI"
  | "botFirmware";

export type DiagnosisProps = Record<DiagnosisName, boolean>;

export const diagnosisStatus = (props: DiagnosisProps): boolean =>
  props.userMQTT && props.botAPI && props.botMQTT && props.botFirmware;

export const DiagnosisSaucer = (props: DiagnosisProps) => {
  const diagnosisBoolean = diagnosisStatus(props);
  const diagnosisColor = diagnosisBoolean ? "green" : "red";
  const title = diagnosisBoolean ? t("Ok") : t("Error");
  return <div className={"saucer active " + diagnosisColor} title={title} />;
};

export function Diagnosis(props: DiagnosisProps) {
  const diagnosisBoolean = diagnosisStatus(props);
  const diagnosisColor = diagnosisBoolean ? "green" : "red";
  const title = diagnosisBoolean ? t("Ok") : t("Error");
  return <div>
    <div className={"connectivity-diagnosis"}>
      <h4>{t("Diagnosis")}</h4>
    </div>
    <Row>
      <Col xs={1}>
        <div className={"saucer active " + diagnosisColor} title={title} />
        <div className={"saucer-connector last " + diagnosisColor} />
      </Col>
      <Col xs={10} className={"connectivity-diagnosis"}>
        <p>
          {diagnose(props)}
        </p>
        <a href={docLink("connecting-farmbot-to-the-internet")} target="_blank">
          <i className="fa fa-external-link" />
          {t("Click here to learn more about error codes.")}
        </a>
      </Col>
    </Row>
  </div>;
}

export function diagnose(x: DiagnosisProps) {
  const errorCode = bitArray(
    x.userAPI,
    x.userMQTT,
    x.botMQTT,
    x.botAPI,
    x.botFirmware);
  const errMsg = TRUTH_TABLE[errorCode] || DiagnosticMessages.MISC;
  return `${t(errMsg)} (code ${errorCode})`;
}
