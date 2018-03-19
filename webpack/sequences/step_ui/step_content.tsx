import * as React from "react";
import { Row, Col } from "../../ui/index";

interface StepContentProps {
  children?: React.ReactChild | React.ReactChild[];
  className: string;
}

export function StepContent(props: StepContentProps) {
  const { className } = props;
  return <Row>
    <Col sm={12}>
      <div className={`step-content ${className}`}>
        {props.children}
      </div>
    </Col>
  </Row>;
}
