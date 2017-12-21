import * as React from "react";
import { JSXChildren } from "../../util";

interface StepWrapperProps {
  children?: JSXChildren;
  className?: string;
}

export function StepWrapper(props: StepWrapperProps) {
  const { className } = props;
  return <div className={`step-wrapper ${className ? className : ""}`}>
    {props.children}
  </div>;
}
