import * as React from "react";
import { CowardlyDictionary } from "../../util";
import { Row, Col } from "../../ui/index";

/** Data model for a single row within the <ConnectivityPanel /> */
export interface StatusRowProps {
  connectionStatus?: boolean | undefined;
  from: string;
  to: string;
  children?: React.ReactChild;
  connectionName?: string;
  hover?: Function;
  hoveredConnection?: string | undefined;
}

const iconLookup: CowardlyDictionary<string> = {
  true: "green",
  false: "red"
};

export function ConnectivityRow(props: StatusRowProps) {
  const colorClass = iconLookup["" + props.connectionStatus] || "grey";
  const hoverClass = props.hoveredConnection === props.connectionName ? "hover" : "";
  const hoverOver = props.hover ? props.hover : () => { };

  const getTitle = () => {
    switch (props.connectionStatus) {
      case undefined: return "Status";
      case true: return "Ok";
      default: return "Error";
    }
  };

  return <Row>
    <Col xs={1}>
      <div className={`saucer active ${colorClass} ${hoverClass}`}
        title={getTitle()}
        onMouseEnter={hoverOver(props.connectionName)}
        onMouseLeave={hoverOver(undefined)} />
      <div className={`saucer-connector ${colorClass}`} />
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
