import { TaggedPeripheral, FirmwareHardware } from "farmbot";
import { Pins } from "farmbot/dist";
import { BotState } from "../../devices/interfaces";

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
}

export interface PeripheralsProps {
  bot: BotState;
  peripherals: TaggedPeripheral[];
  dispatch: Function;
  firmwareHardware: FirmwareHardware | undefined;
}
