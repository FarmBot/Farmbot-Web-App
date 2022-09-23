import React from "react";
import { Row, Col } from "../../ui";
import { t } from "../../i18next_wrapper";
import { syncText } from "../../nav/sync_text";
import { SyncStatus } from "farmbot";

/** Data model for a single row within the <ConnectivityPanel /> */
export interface StatusRowProps {
  connectionStatus?: boolean | undefined;
  from: string;
  to: string;
  header?: boolean;
  connectionMsg?: React.ReactChild;
  connectionName?: string;
  hover?: Function;
  hoveredConnection?: string | undefined;
  syncStatus?: SyncStatus;
}

const colorLookup: Record<string, string> = {
  true: "green",
  false: "red",
  undefined: "gray"
};

const iconLookup: Record<string, string> = {
  true: "check",
  false: "times",
  undefined: "question"
};

export function ConnectivityRow(props: StatusRowProps) {
  const {
    connectionStatus, connectionName, hoveredConnection, syncStatus,
  } = props;
  const colorClass = colorLookup["" + connectionStatus];
  const connectorColorClass =
    connectionName === "botFirmware" && colorClass === "gray"
      ? "red"
      : colorClass;
  const hoverClass = hoveredConnection === connectionName ? "hover" : "";
  const hoverOver = props.hover ? props.hover : () => { };
  const className = props.header
    ? "saucer active grey"
    : `diagnosis-indicator saucer active ${colorClass} ${hoverClass}`;
  const icon = iconLookup["" + connectionStatus];
  const iconClass = syncStatus == "syncing" ? "spinner fa-pulse" : icon;

  const getTitle = (header?: boolean) => {
    if (header) { return t("Status"); }
    switch (connectionStatus) {
      case undefined: return t("Unknown");
      case true: return t("Ok");
      default: return t("Error");
    }
  };

  const browserFrom = window.innerWidth <= 450
    ? t("This phone")
    : t("This computer");

  return <Row>
    <Col xs={1}>
      <div className={className}
        title={syncStatus ? syncText(syncStatus) : getTitle(props.header)}
        onMouseEnter={hoverOver(connectionName)}
        onMouseLeave={hoverOver(undefined)}>
        {!props.header && <i className={`fa fa-${iconClass}`} />}
      </div>
      {!props.header &&
        <div className={`saucer-connector ${connectorColorClass}`} />}
    </Col>
    <Col xs={2}>
      <p>
        {props.from == "browser" ? browserFrom : props.from}
      </p>
    </Col>
    <Col xs={2}>
      <p>
        {props.to}
      </p>
    </Col>
    <Col xs={7}>
      <p>
        {props.header ? t("last message seen ") : props.connectionMsg}
      </p>
    </Col>
  </Row>;
}
