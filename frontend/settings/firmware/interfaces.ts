import { BotState, SourceFbosConfig } from "../../devices/interfaces";
import { Alert, FirmwareHardware } from "farmbot";
import { TimeSettings } from "../../interfaces";

export interface BoardTypeProps {
  botOnline: boolean;
  bot: BotState;
  alerts: Alert[];
  dispatch: Function;
  timeSettings: TimeSettings;
  sourceFbosConfig: SourceFbosConfig;
  firmwareHardware: FirmwareHardware | undefined;
}
