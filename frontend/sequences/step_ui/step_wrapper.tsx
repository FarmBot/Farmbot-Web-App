import * as React from "react";
import { ErrorBoundary } from "../../error_boundary";

interface StepWrapperProps {
  children?: React.ReactNode;
  className?: string;
}

export function StepWrapper(props: StepWrapperProps) {
  const { className } = props;
  return <div className={`step-wrapper ${className ? className : ""}`}>
    <ErrorBoundary>
      {props.children}
    </ErrorBoundary>
  </div>;
}
