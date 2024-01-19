import { ResourceIndex } from "../../resources/interfaces";
import {
  PinBindingType,
  PinBindingSpecialAction,
} from "farmbot/dist/resources/api_resources";
import { FirmwareHardware } from "farmbot";
import { SettingsPanelState } from "../../interfaces";
import { BotState } from "../../devices/interfaces";

export interface PinBindingsProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  resources: ResourceIndex;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface PinBindingsContentProps {
  dispatch: Function;
  resources: ResourceIndex;
  firmwareHardware: FirmwareHardware | undefined;
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
  dispatch: Function;
}

export interface PinBindingInputGroupProps {
  dispatch: Function;
  resources: ResourceIndex;
  pinBindings: PinBindingListItems[];
  firmwareHardware: FirmwareHardware | undefined;
}

export interface PinBindingInputGroupState {
  isEditing: boolean;
  pinNumberInput: number | undefined;
  sequenceIdInput: number | undefined;
  specialActionInput: PinBindingSpecialAction | undefined;
  bindingType: PinBindingType;
}

export interface BoxTopBaseProps {
  isEditing: boolean;
  dispatch: Function;
  resources: ResourceIndex;
  botOnline: boolean;
  bot: BotState;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface BoxTopProps extends BoxTopBaseProps {
  threeDimensions: boolean;
}
