import { BotState, ShouldDisplay } from "../interfaces";
import { NetworkState } from "../../connectivity/interfaces";
import { ResourceIndex } from "../../resources/interfaces";

export type PinBinding = StandardPinBinding | SpecialPinBinding;

interface PinBindingBase { id?: number; pin_num: number; }

export enum PinBindingType {
  special = "special",
  standard = "standard",
}

interface StandardPinBinding extends PinBindingBase {
  binding_type: PinBindingType.standard;
  sequence_id: number;
}

export interface SpecialPinBinding extends PinBindingBase {
  binding_type: PinBindingType.special;
  special_action: PinBindingSpecialAction;
}

export enum PinBindingSpecialAction {
  emergency_lock = "emergency_lock",
  emergency_unlock = "emergency_unlock",
  sync = "sync",
  reboot = "reboot",
  power_off = "power_off",
  dump_info = "dump_info",
  read_status = "read_status",
  take_photo = "take_photo",
}

export interface PinBindingsProps {
  bot: BotState;
  dispatch: Function;
  botToMqttStatus: NetworkState;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
}

export interface PinBindingListItems {
  pin_number: number,
  sequence_id: number | undefined,
  special_action?: PinBindingSpecialAction | undefined,
  binding_type?: PinBindingType,
  uuid?: string
}

export interface PinBindingsListProps {
  pinBindings: PinBindingListItems[];
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
  dispatch: Function;
}

export interface PinBindingInputGroupProps {
  dispatch: Function;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
  pinBindings: PinBindingListItems[];
}

export interface PinBindingInputGroupState {
  isEditing: boolean;
  pinNumberInput: number | undefined;
  sequenceIdInput: number | undefined;
  specialActionInput: PinBindingSpecialAction | undefined;
  bindingType: PinBindingType;
}
