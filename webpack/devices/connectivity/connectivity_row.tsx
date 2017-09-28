import * as React from "react";
import { CowardlyDictionary } from "../../util";
import { Row, Col } from "../../ui/index";
import { isUndefined } from "lodash";

/** Data model for a single row within the <ConnectivityPanel /> */
export interface StatusRowProps {
  connectionStatus?: boolean | undefined;
  from: string;
  to: string;
  children?: React.ReactChild;
}

const iconLookup: CowardlyDictionary<string> = {
  true: "green",
  false: "red"
};

export function ConnectivityRow(props: StatusRowProps) {
  const classColor = iconLookup["" + props.connectionStatus] || "grey";
  const getTitle = () => {
    if (isUndefined(props.connectionStatus)) {
      return "Status";
    } else if (props.connectionStatus) {
      return "Ok";
    } else {
      return "Error";
    }
  };
  return <Row>
    <Col xs={1}>
      <div className={"saucer active " + classColor} title={getTitle()} />
      <div className={"saucer-connector " + classColor} />
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
