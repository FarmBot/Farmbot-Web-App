import { BotState, ShouldDisplay } from "../interfaces";
import { NetworkState } from "../../connectivity/interfaces";
import { ResourceIndex } from "../../resources/interfaces";
import {
  PinBindingType,
  PinBindingSpecialAction
} from "farmbot/dist/resources/api_resources";

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
