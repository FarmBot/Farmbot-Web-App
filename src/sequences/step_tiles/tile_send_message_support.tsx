import { ALLOWED_CHANNEL_NAMES, Channel } from "farmbot/dist";

/** All the attributes/config you need to render a Channel */
interface ChanInfo {
  /** Always check it? */
  alwaysOn: boolean;
  /** CeleryScript name */
  name: ALLOWED_CHANNEL_NAMES;
  /** Human readable name */
  label: string;
}

export const EACH_CHANNEL: ChanInfo[] = [
  { alwaysOn: true, name: "ticker", label: "Ticker Notification" },
  { alwaysOn: false, name: "toast", label: "Toast Pop Up" },
  { alwaysOn: false, name: "email", label: "Email" }
];

export const MESSAGE_STATUSES = [
  { value: "success", label: "Success" },
  { value: "busy", label: "Busy" },
  { value: "warn", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "info", label: "Info" }
];

export function channel(channel_name: ALLOWED_CHANNEL_NAMES): Channel {
  return { kind: "channel", args: { channel_name } }
}
