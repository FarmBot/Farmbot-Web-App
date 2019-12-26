import * as React from "react";
import { Row, Col } from "../../ui/index";
import { ErrorBoundary } from "../../error_boundary";

interface StepContentProps {
  children?: React.ReactNode;
  className: string;
}

export function StepContent(props: StepContentProps) {
  const { className } = props;
  return <Row>
    <Col sm={12}>
      <div className={`step-content ${className}`}>
        <ErrorBoundary>
          {props.children}
        </ErrorBoundary>
      </div>
    </Col>
  </Row>;
}
