import * as React from "react";
import { DiagnosticMessages } from "./diagnostic_messages";
import { Col, Row } from "../../ui/index";
import { bitArray } from "../../util";
import { TRUTH_TABLE } from "./truth_table";
import { t } from "i18next";

export type DiagnosisName =
  | "userAPI"
  | "userMQTT"
  | "botMQTT"
  | "botAPI"
  | "botFirmware";

export type DiagnosisProps = Record<DiagnosisName, boolean>;

export function Diagnosis(props: DiagnosisProps) {
  const diagnosisStatus =
    props.userMQTT && props.botAPI && props.botMQTT && props.botFirmware;
  const diagnosisColor = diagnosisStatus ? "green" : "red";
  const title = diagnosisStatus ? "Ok" : "Error";
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
