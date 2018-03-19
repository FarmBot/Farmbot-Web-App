import * as React from "react";

interface StepWrapperProps {
  children?: React.ReactChild | React.ReactChild[];
  className?: string;
}

export function StepWrapper(props: StepWrapperProps) {
  const { className } = props;
  return <div className={`step-wrapper ${className ? className : ""}`}>
    {props.children}
  </div>;
}
