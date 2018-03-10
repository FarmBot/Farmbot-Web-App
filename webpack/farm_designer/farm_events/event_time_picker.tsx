import * as React from "react";
import { BlurableInput } from "../../ui/index";

interface Props {
  /** String, formatted as hh:mm (UTC 24hr time).
   * Ex: 23:45, 06:12 */
  value: string;
  tzOffset: number;
  onCommit(ev: React.SyntheticEvent<HTMLInputElement>): void;
  disabled?: boolean;
  name: string;
  className: string;
}

export function EventTimePicker(props: Props) {
  const { value, onCommit, disabled, name } = props;
  return <BlurableInput
    disabled={!!disabled}
    name={name}
    type="time"
    className="add-event-start-time"
    value={value}
    onCommit={onCommit} />;
}
