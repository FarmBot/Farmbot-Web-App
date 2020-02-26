import * as React from "react";
import {
  PinBindingType,
  PinBindingSpecialAction,
  PinBinding
} from "farmbot/dist/resources/api_resources";
import { PinBindingListItems } from "./interfaces";
import { stockPinBindings } from "./list_and_label_support";
import { initSave } from "../../api/crud";
import { t } from "../../i18next_wrapper";
import { FirmwareHardware } from "farmbot";
import { hasButtons } from "../components/firmware_hardware_support";

/** Return the correct Pin Binding resource according to binding type. */
export const pinBindingBody =
  (bodyInputs: {
    pin_num: number,
    binding_type: PinBindingType,
    sequence_id?: number | undefined,
    special_action?: PinBindingSpecialAction | undefined
  }): PinBinding => {
    const { pin_num, binding_type, special_action, sequence_id } = bodyInputs;
    const body: PinBinding =
      binding_type == PinBindingType.special
        ? {
          pin_num,
          binding_type,
          special_action: special_action
            || PinBindingSpecialAction.emergency_lock,
        }
        : {
          pin_num,
          binding_type,
          sequence_id: sequence_id || 0,
        };
    return body;
  };

export interface StockPinBindingsButtonProps {
  dispatch: Function;
  firmwareHardware: FirmwareHardware | undefined;
}

/** Add default pin bindings. */
export const StockPinBindingsButton = (props: StockPinBindingsButtonProps) =>
  <div className="stock-pin-bindings-button">
    <button
      className="fb-button green"
      hidden={!hasButtons(props.firmwareHardware)}
      onClick={() => stockPinBindings.map(binding =>
        props.dispatch(initSave("PinBinding", pinBindingBody(binding))))}>
      <i className="fa fa-plus" />
      {t("Stock Bindings")}
    </button>
  </div>;

/** FarmBot OS built-in pin binding data used by Pin Bindings widget. */
export const sysBtnBindingData: PinBindingListItems[] = [];

/** Pin numbers reserved for built-in pin bindings. */
export const sysBtnBindings: number[] = [];
