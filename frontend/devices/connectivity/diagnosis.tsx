import React from "react";
import { DiagnosticMessages } from "../../constants";
import { Col, Row, docLinkClick } from "../../ui";
import { bitArray } from "../../util";
import { TRUTH_TABLE } from "./truth_table";
import { t } from "../../i18next_wrapper";
import { goToFbosSettings } from "../../settings/maybe_highlight";
import { SyncStatus } from "farmbot";
import { syncText } from "../../nav/sync_text";

export type ConnectionName =
  | "userAPI"
  | "userMQTT"
  | "botMQTT"
  | "botAPI"
  | "botFirmware";

export type ConnectionStatusFlags = Record<ConnectionName, boolean>;
export interface DiagnosisProps {
  statusFlags: ConnectionStatusFlags;
  hideGraphic?: boolean;
}
export interface DiagnosisSaucerProps extends ConnectionStatusFlags {
  className?: string;
  syncStatus?: SyncStatus;
}

const diagnosisStatus = (flags: ConnectionStatusFlags): boolean =>
  flags.userMQTT && flags.botAPI && flags.botMQTT && flags.botFirmware;

export const DiagnosisSaucer = (props: DiagnosisSaucerProps) => {
  const diagnosisBoolean = diagnosisStatus(props);
  const diagnosisColor = diagnosisBoolean ? "green" : "red";
  const diagnosisIcon = diagnosisBoolean ? "check" : "times";
  const spinner = props.syncStatus == "syncing";
  const diagnosisIconClass = spinner ? "spinner fa-pulse" : diagnosisIcon;
  const title = diagnosisBoolean ? t("Ok") : t("Error");
  const classes = [
    "diagnosis-indicator", "saucer", "active", diagnosisColor, props.className,
  ];
  return <div className={classes.join(" ")}
    title={props.syncStatus ? syncText(props.syncStatus) : title}>
    <i className={`fa fa-${diagnosisIconClass}`} />
  </div>;
};

export function Diagnosis(props: DiagnosisProps) {
  const diagnosisBoolean = diagnosisStatus(props.statusFlags);
  const diagnosisColor = diagnosisBoolean ? "green" : "red";
  return <div className={"diagnosis-section"}>
    <div className={"connectivity-diagnosis"}>
      <h4>{t("Diagnosis")}</h4>
    </div>
    <Row>
      <Col xs={1} hidden={props.hideGraphic}>
        <DiagnosisSaucer {...props.statusFlags} />
        <div className={"saucer-connector last " + diagnosisColor} />
      </Col>
      <Col xs={10} className={"connectivity-diagnosis"}>
        <p className="blinking">
          {t("Always")}&nbsp;
          <a className="blinking" onClick={goToFbosSettings}>
            <u>{t("upgrade FarmBot OS")}</u>
          </a>
          &nbsp;{t("before troubleshooting.")}
        </p>
        <p>
          {diagnosisMessage(getDiagnosisCode(props.statusFlags))}
        </p>
        <a onClick={docLinkClick("connecting-farmbot-to-the-internet")}>
          <i className="fa fa-external-link" />
          {t("Click here to learn more about connectivity codes.")}
        </a>
        <a onClick={docLinkClick("for-it-security-professionals")}>
          <i className="fa fa-external-link" />
          {t("Click here for document to show to your IT department.")}
        </a>
      </Col>
    </Row>
  </div>;
}

export function getDiagnosisCode(statusFlags: ConnectionStatusFlags) {
  const errorCode = bitArray(
    statusFlags.userAPI,
    statusFlags.userMQTT,
    statusFlags.botMQTT,
    statusFlags.botAPI,
    statusFlags.botFirmware);
  return errorCode;
}

export function diagnosisMessage(errorCode: number) {
  const errMsg = TRUTH_TABLE[errorCode] || DiagnosticMessages.MISC;
  return `${t(errMsg)} (code ${errorCode})`;
}
