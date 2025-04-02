import React from "react";
import { DeviceSetting, DiagnosticMessages } from "../../constants";
import { Row, docLinkClick } from "../../ui";
import { bitArray } from "../../util";
import { TRUTH_TABLE } from "./truth_table";
import { t } from "../../i18next_wrapper";
import { SyncStatus } from "farmbot";
import { syncText } from "../../nav/sync_text";
import { useNavigate } from "react-router";
import { linkToSetting } from "../../settings/maybe_highlight";
import { setPanelOpen } from "../../farm_designer/panel_header";

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
  dispatch: Function;
}
export interface DiagnosisSaucerProps extends ConnectionStatusFlags {
  className?: string;
  syncStatus?: SyncStatus;
  onClick?(): void;
}

const diagnosisStatus = (flags: ConnectionStatusFlags): boolean =>
  flags.userMQTT && flags.botAPI && flags.botMQTT && flags.botFirmware;

export const DiagnosisSaucer = (props: DiagnosisSaucerProps) => {
  const diagnosisBoolean = diagnosisStatus(props);
  const diagnosisColor = diagnosisBoolean ? "green" : "red";
  const diagnosisIcon = diagnosisBoolean ? "fa-check" : "fa-times";
  const spinner = props.syncStatus == "syncing";
  const diagnosisIconClass = spinner ? "fa-spinner fa-pulse" : diagnosisIcon;
  const title = diagnosisBoolean ? t("Ok") : t("Error");
  const classes = [
    "diagnosis-indicator", "saucer", "active", diagnosisColor, props.className,
  ];
  return <div className={classes.join(" ")}
    onClick={props.onClick}
    title={props.syncStatus ? syncText(props.syncStatus) : title}>
    <i className={`fa ${diagnosisIconClass}`} />
  </div>;
};

export function Diagnosis(props: DiagnosisProps) {
  const diagnosisBoolean = diagnosisStatus(props.statusFlags);
  const diagnosisColor = diagnosisBoolean ? "green" : "red";
  const navigate = useNavigate();
  return <Row className="diagnosis-section grid-exp-2">
    <div hidden={props.hideGraphic}>
      <DiagnosisSaucer {...props.statusFlags} />
      <div className={"saucer-connector last " + diagnosisColor} />
    </div>
    <div className={"connectivity-diagnosis"}>
      <h4>{t("Diagnosis")}</h4>
      <p className="blinking">
        {t("Always")}&nbsp;
        <a className="blinking"
          onClick={() => {
            props.dispatch(setPanelOpen(true));
            navigate(linkToSetting(DeviceSetting.farmbotOS));
          }}>
          <u>{t("upgrade FarmBot OS")}</u>
        </a>
        &nbsp;{t("before troubleshooting.")}
      </p>
      <p>
        {diagnosisMessage(getDiagnosisCode(props.statusFlags))}
      </p>
      <a onClick={docLinkClick({
        slug: "connecting-farmbot-to-the-internet",
        navigate,
        dispatch: props.dispatch,
      })}>
        <i className="fa fa-external-link" />
        {t("Click here to learn more about connectivity codes.")}
      </a>
      <a onClick={docLinkClick({
        slug: "for-it-security-professionals",
        navigate,
        dispatch: props.dispatch,
      })}>
        <i className="fa fa-external-link" />
        {t("Click here for document to show to your IT department.")}
      </a>
    </div>
  </Row>;
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
