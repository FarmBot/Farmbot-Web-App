import { Channel } from "farmbot";
import { ChannelName, MessageType } from "../interfaces";
import { t } from "../../i18next_wrapper";

/** All the attributes/config you need to render a Channel */
interface ChanInfo {
  /** Always check it? */
  alwaysOn: boolean;
  /** CeleryScript name */
  name: ChannelName;
  /** Human readable name */
  label: string;
}

export const EACH_CHANNEL = (): ChanInfo[] => [
  { alwaysOn: true, name: "ticker", label: t("Ticker Notification") },
  { alwaysOn: false, name: "toast", label: t("Toast Pop Up") },
  { alwaysOn: false, name: "email", label: t("Email") },
  { alwaysOn: false, name: "espeak", label: t("Speak") },
];

export const MESSAGE_STATUSES = () => [
  { value: MessageType.success, label: t("Success") },
  { value: MessageType.busy, label: t("Busy") },
  { value: MessageType.warn, label: t("Warning") },
  { value: MessageType.error, label: t("Error") },
  { value: MessageType.info, label: t("Info") },
];

export const MESSAGE_STATUSES_DDI = () => {
  const STATUSES = MESSAGE_STATUSES();
  return {
    [STATUSES[0].value]: {
      label: STATUSES[0].label,
      value: STATUSES[0].value
    },
    [STATUSES[1].value]: {
      label: STATUSES[1].label,
      value: STATUSES[1].value
    },
    [STATUSES[2].value]: {
      label: STATUSES[2].label,
      value: STATUSES[2].value
    },
    [STATUSES[3].value]: {
      label: STATUSES[3].label,
      value: STATUSES[3].value
    },
    [STATUSES[4].value]: {
      label: STATUSES[4].label,
      value: STATUSES[4].value
    }
  };
};

export function channel(channel_name: ChannelName): Channel {
  return { kind: "channel", args: { channel_name } };
}
