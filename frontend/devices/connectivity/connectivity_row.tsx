import * as React from "react";
import { CowardlyDictionary } from "../../util";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";

/** Data model for a single row within the <ConnectivityPanel /> */
export interface StatusRowProps {
  connectionStatus?: boolean | undefined;
  from: string;
  to: string;
  header?: boolean;
  children?: React.ReactChild;
  connectionName?: string;
  hover?: Function;
  hoveredConnection?: string | undefined;
}

const iconLookup: CowardlyDictionary<string> = {
  true: "green",
  false: "red",
  undefined: "yellow"
};

export function ConnectivityRow(props: StatusRowProps) {
  const { connectionStatus, connectionName, hoveredConnection } = props;
  const colorClass = iconLookup["" + connectionStatus] || "grey";
  const connectorColorClass = connectionName === "botFirmware" &&
    colorClass === "yellow" ? "red" : colorClass;
  const hoverClass = hoveredConnection === connectionName ? "hover" : "";
  const hoverOver = props.hover ? props.hover : () => { };
  const className = props.header
    ? "saucer active grey"
    : `saucer active ${colorClass} ${hoverClass}`;

  const getTitle = () => {
    switch (connectionStatus) {
      case undefined: return t("Unknown");
      case true: return t("Ok");
      default: return t("Error");
    }
  };

  return <Row>
    <Col xs={1}>
      <div className={className}
        title={props.header ? t("Status") : getTitle()}
        onMouseEnter={hoverOver(connectionName)}
        onMouseLeave={hoverOver(undefined)} />
      {!props.header &&
        <div className={`saucer-connector ${connectorColorClass}`} />}
    </Col>
    <Col xs={2}>
      <p>
        {props.from}
      </p>
    </Col>
    <Col xs={2}>
      <p>
        {props.to}
      </p>
    </Col>
    <Col xs={7}>
      <p>
        {props.children}
      </p>
    </Col>
  </Row>;
}
