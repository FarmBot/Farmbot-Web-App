import { TaggedDevice, FirmwareHardware } from "farmbot";
import { BotState } from "../interfaces";
import { ConnectionName, ConnectionStatusFlags } from "./diagnosis";
import { StatusRowProps } from "./connectivity_row";
import {
  browserToMQTT, browserToAPI, botToMQTT, botToAPI, botToFirmware,
} from "./status_checks";
import { t } from "../../i18next_wrapper";
import { forceOnline } from "../must_be_online";
import moment from "moment";

export interface ConnectivityDataProps {
  bot: BotState;
  device: TaggedDevice;
  apiFirmwareValue: FirmwareHardware | undefined;
}

export const connectivityData = (props: ConnectivityDataProps) => {
  const fwVersion = props.bot.hardware
    .informational_settings.firmware_version;

  /** A record of all the things we know about connectivity right now. */
  const data: Record<ConnectionName, StatusRowProps> =
    forceOnline()
      ? {
        userMQTT: browserToMQTT({ state: "up", at: moment().valueOf() }),
        userAPI: browserToAPI({ state: "up", at: moment().valueOf() }),
        botMQTT: botToMQTT({ state: "up", at: moment().valueOf() }),
        botAPI: botToAPI("" + moment().toISOString()),
        botFirmware: botToFirmware("0.0.0.E", "express_k10"),
      }
      : {
        userMQTT: browserToMQTT(props.bot.connectivity.uptime["user.mqtt"]),
        userAPI: browserToAPI(props.bot.connectivity.uptime["user.api"]),
        botMQTT: botToMQTT(props.bot.connectivity.uptime["bot.mqtt"]),
        botAPI: botToAPI(props.device.body.last_saw_api),
        botFirmware: botToFirmware(fwVersion, props.apiFirmwareValue),
      };

  /** Override statuses that require higher-level connections. */
  if (!data.userMQTT.connectionStatus) {
    data.botMQTT.connectionStatus = undefined;
    data.botMQTT.connectionMsg = t("Unknown.");
  }
  if (!data.userAPI.connectionStatus) {
    data.botAPI.connectionStatus = undefined;
    data.botAPI.connectionMsg = t("Unknown.");
  }
  if (!data.botMQTT.connectionStatus) {
    data.botFirmware.connectionStatus = undefined;
    data.botFirmware.connectionMsg = t("Unknown.");
  }

  const flags: ConnectionStatusFlags = {
    userMQTT: !!data.userMQTT.connectionStatus,
    userAPI: !!data.userAPI.connectionStatus,
    botMQTT: !!data.botMQTT.connectionStatus,
    botAPI: !!data.botAPI.connectionStatus,
    botFirmware: !!data.botFirmware.connectionStatus,
  };

  /** Shuffle these around to change the ordering of the status table. */
  const rowData: StatusRowProps[] = [
    data.userAPI,
    data.userMQTT,
    data.botMQTT,
    data.botAPI,
    data.botFirmware,
  ];
  return { data, flags, rowData };
};
