import * as React from "react";
import {
  PinBindingType, PinBindingSpecialAction, PinBinding, PinBindingListItems
} from "./interfaces";
import { TaggedPinBinding, SpecialStatus } from "farmbot";
import { ShouldDisplay, Feature } from "../interfaces";
import { stockPinBindings } from "./list_and_label_support";
import { initSave } from "../../api/crud";
import { t } from "i18next";

/** Return the correct Pin Binding resource according to binding type. */
export const taggedPinBinding =
  (bodyInputs: {
    pin_num: number,
    binding_type: PinBindingType,
    sequence_id?: number | undefined,
    special_action?: PinBindingSpecialAction | undefined
  }): TaggedPinBinding => {
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
    return {
      uuid: "WILL_BE_CHANGED_BY_REDUCER",
      specialStatus: SpecialStatus.SAVED,
      kind: "PinBinding",
      body
    };
  };

/** Add default pin bindings. */
export const StockPinBindingsButton =
  ({ shouldDisplay, dispatch }: {
    shouldDisplay: ShouldDisplay, dispatch: Function
  }) =>
    <div className="stock-pin-bindings-button">
      {shouldDisplay(Feature.api_pin_bindings) &&
        <button
          className="fb-button green"
          onClick={() =>
            stockPinBindings.map(binding =>
              dispatch(initSave(taggedPinBinding(binding))))}>
          <i className="fa fa-plus" />
          {t("v1.4 Stock Bindings")}
        </button>}
    </div>;

/** FarmBot OS built-in pin binding data used by Pin Bindings widget. */
export const sysBtnBindingData: PinBindingListItems[] = [];

/** Pin numbers reserved for built-in pin bindings. */
export const sysBtnBindings: number[] = [];
