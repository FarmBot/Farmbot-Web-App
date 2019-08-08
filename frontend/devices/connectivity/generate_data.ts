import { TaggedDevice } from "farmbot";
import { BotState } from "../interfaces";
import { DiagnosisName, DiagnosisProps } from "./diagnosis";
import { StatusRowProps } from "./connectivity_row";
import {
  browserToMQTT, browserToAPI, botToMQTT, botToAPI, botToFirmware
} from "./status_checks";

interface ConnectivityDataProps {
  bot: BotState;
  device: TaggedDevice;
}

export const connectivityData = (props: ConnectivityDataProps) => {
  const fwVersion = props.bot.hardware
    .informational_settings.firmware_version;

  /** A record of all the things we know about connectivity right now. */
  const data: Record<DiagnosisName, StatusRowProps> = {
    userMQTT: browserToMQTT(props.bot.connectivity["user.mqtt"]),
    userAPI: browserToAPI(props.bot.connectivity["user.api"]),
    botMQTT: botToMQTT(props.bot.connectivity["bot.mqtt"]),
    botAPI: botToAPI(props.device.body.last_saw_api),
    botFirmware: botToFirmware(fwVersion),
  };

  const flags: DiagnosisProps = {
    userMQTT: !!data.userMQTT.connectionStatus,
    userAPI: !!data.userAPI,
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
