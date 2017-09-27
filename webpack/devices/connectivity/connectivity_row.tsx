import * as React from "react";
import { CowardlyDictionary } from "../../util";
import { Row, Col } from "../../ui/index";

/** Data model for a single row within the <ConnectivityPanel /> */
export interface StatusRowProps {
  connectionStatus?: boolean | undefined;
  from: string;
  to: string;
  children?: React.ReactChild;
}

const iconLookup: CowardlyDictionary<string> = {
  true: "saucer green active",
  false: "saucer red active"
};

export function ConnectivityRow(props: StatusRowProps) {
  const className = iconLookup["" + props.connectionStatus] || "saucer yellow active";
  return <Row>
    <Col xs={1}>
      <div className={className}></div>
    </Col>
    <Col xs={1}>
      <p>
        {props.from}
      </p>
    </Col>
    <Col xs={1}>
      <p>
        {props.to}
      </p>
    </Col>
    <Col xs={9}>
      <p>
        {props.children}
      </p>
    </Col>
  </Row>;
}
