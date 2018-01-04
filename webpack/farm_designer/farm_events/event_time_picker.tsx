import * as React from "react";
import { BlurableInput } from "../../ui/blurable_input";
import * as moment from "moment";

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

const FORMAT = "HH:mm";

export function utcToBotTime(utcValue: string, tzOffset: number) {
  const botLocalTime = moment(utcValue, FORMAT).clone().add(tzOffset, "hours").format(FORMAT);
  return botLocalTime;
}

export function botTimeToUtc(value: string, tzOffset: number) {
  return moment(value, FORMAT).clone().subtract(tzOffset, "hours").format(FORMAT);
}

export function EventTimePicker(props: Props) {
  const { value, onCommit, /*tzOffset,*/ disabled, name } = props;
  return <BlurableInput
    disabled={!!disabled}
    name={name}
    type="time"
    className="add-event-start-time"
    value={value}
    onCommit={onCommit} />;
}
