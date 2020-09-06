import React from "react";
import { DiagnosticMessages } from "../../constants";
import { Col, Row, docLink } from "../../ui/index";
import { bitArray } from "../../util";
import { TRUTH_TABLE } from "./truth_table";
import { t } from "../../i18next_wrapper";
import { linkToFbosSettings } from "../../settings/maybe_highlight";

export type DiagnosisName =
  | "userAPI"
  | "userMQTT"
  | "botMQTT"
  | "botAPI"
  | "botFirmware";

export type DiagnosisProps = Record<DiagnosisName, boolean>;
export interface DiagnosisSaucerProps extends DiagnosisProps {
  className?: string;
}

export const diagnosisStatus = (props: DiagnosisProps): boolean =>
  props.userMQTT && props.botAPI && props.botMQTT && props.botFirmware;

export const DiagnosisSaucer = (props: DiagnosisSaucerProps) => {
  const diagnosisBoolean = diagnosisStatus(props);
  const diagnosisColor = diagnosisBoolean ? "green" : "red";
  const title = diagnosisBoolean ? t("Ok") : t("Error");
  const classes = [
    "diagnosis-indicator", "saucer", "active", diagnosisColor, props.className,
  ];
  return <div className={classes.join(" ")}
    title={title}>
    <i className={`fa fa-${diagnosisBoolean ? "check" : "times"}`} />
  </div>;
};

export function Diagnosis(props: DiagnosisProps) {
  const diagnosisBoolean = diagnosisStatus(props);
  const diagnosisColor = diagnosisBoolean ? "green" : "red";
  return <div className={"diagnosis-section"}>
    <div className={"connectivity-diagnosis"}>
      <h4>{t("Diagnosis")}</h4>
    </div>
    <Row>
      <Col xs={1}>
        <DiagnosisSaucer {...props} />
        <div className={"saucer-connector last " + diagnosisColor} />
      </Col>
      <Col xs={10} className={"connectivity-diagnosis"}>
        <p className="blinking">
          {t("Always")}&nbsp;
          <a className="blinking" href={linkToFbosSettings()}>
            <u>{t("upgrade FarmBot OS")}</u>
          </a>
            &nbsp;{t("before troubleshooting.")}
        </p>
        <p>
          {diagnose(props)}
        </p>
        <a href={docLink("connecting-farmbot-to-the-internet")}
          target="_blank" rel={"noreferrer"}>
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
