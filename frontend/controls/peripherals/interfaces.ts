import { Pins, TaggedPeripheral, FirmwareHardware } from "farmbot";
import { BotState } from "../../devices/interfaces";
import { ResourceIndex } from "../../resources/interfaces";
import { GetWebAppConfigValue } from "../../config_storage/actions";

export interface PeripheralState {
  isEditing: boolean;
}

export interface PeripheralFormProps {
  dispatch: Function;
  peripherals: TaggedPeripheral[];
}

export interface PeripheralListProps {
  dispatch: Function;
  peripherals: TaggedPeripheral[];
  pins: Pins;
  disabled: boolean | undefined;
  locked: boolean;
}

export interface PeripheralsProps {
  bot: BotState;
  peripherals: TaggedPeripheral[];
  dispatch: Function;
  firmwareHardware: FirmwareHardware | undefined;
  resources: ResourceIndex;
  hidePinBindings?: boolean;
  getConfigValue: GetWebAppConfigValue;
}
