import React from "react";
import { BlurableInput } from "../ui";
import { TimeSettings } from "../interfaces";

interface EventTimePickerProps {
  /** String, formatted as hh:mm (UTC 24hr time).
   * Ex: 23:45, 06:12 */
  value: string;
  timeSettings: TimeSettings;
  onCommit(ev: React.SyntheticEvent<HTMLInputElement>): void;
  disabled?: boolean;
  hidden?: boolean;
  name: string;
  className: string;
  error?: string;
}

export function EventTimePicker(props: EventTimePickerProps) {
  const { value, onCommit, disabled, hidden, name } = props;
  return <BlurableInput
    disabled={!!disabled}
    hidden={!!hidden}
    name={name}
    type="time"
    className="add-event-start-time"
    value={value}
    onCommit={onCommit}
    error={props.error} />;
}
