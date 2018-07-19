import { PinBindingType, PinBindingSpecialAction, PinBinding } from "./interfaces";
import { TaggedPinBinding, SpecialStatus } from "../../resources/tagged_resources";

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
