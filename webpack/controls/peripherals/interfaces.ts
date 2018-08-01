import { TaggedPeripheral } from "farmbot";
import { Pins } from "farmbot/dist";

export interface PeripheralState {
  isEditing: boolean;
}

export interface Peripheral {
  id?: number;
  pin: number | undefined;
  label: string;
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
