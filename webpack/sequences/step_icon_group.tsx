import * as React from "react";
import { Help } from "../ui/help";

interface StepIconBarProps {
  onClone(): void;
  onTrash(): void;
  helpText: string;
}

export function StepIconGroup(props: StepIconBarProps) {
  const { onClone, onTrash, helpText } = props;

  return <span>
    <i className="fa fa-arrows-v step-control" />
    <i className="fa fa-clone step-control" onClick={onClone} />
    <i className="fa fa-trash step-control" onClick={onTrash} />
    <Help text={helpText} />
  </span>;
}
