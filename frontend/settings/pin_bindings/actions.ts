import { DropDownItem } from "../../ui";
import {
  PinBinding,
  PinBindingSpecialAction, PinBindingType, SpecialPinBinding, StandardPinBinding,
} from "farmbot/dist/resources/api_resources";
import { initSave, overwrite, save, destroy } from "../../api/crud";
import { pinBindingBody } from "./tagged_pin_binding_init";
import { ResourceIndex } from "../../resources/interfaces";
import { findByUuid } from "../../resources/reducer_support";
import { cloneDeep, isUndefined } from "lodash";
import { error } from "../../toast/toast";
import { t } from "../../i18next_wrapper";
import { PinBindingListItems } from "./interfaces";
import { apiPinBindings } from "./pin_bindings_content";
import { execSequence, sendRPC } from "../../devices/actions";
import { RpcRequestBodyItem } from "farmbot";

export interface SetPinBindingProps {
  dispatch: Function;
  resources: ResourceIndex;
  binding: PinBindingListItems | undefined;
  pinNumber: number | undefined;
}

export const setPinBinding = (props: SetPinBindingProps) =>
  // eslint-disable-next-line complexity
  (ddi: DropDownItem): boolean => {
    const { binding, dispatch, resources, pinNumber } = props;
    const bindingUuid = binding?.uuid;
    if (isUndefined(pinNumber)) {
      error(t("Pin number cannot be blank."));
      return false;
    }
    if (bindingUuid && ddi.isNull) {
      dispatch(destroy(bindingUuid));
      return false;
    }
    const bindingType = ddi.headingId as PinBindingType | undefined;
    const sequenceIdInput = ddi.headingId == PinBindingType.standard
      ? parseInt("" + ddi.value)
      : undefined;
    const specialActionInput = ddi.headingId == PinBindingType.special
      ? ddi.value as PinBindingSpecialAction
      : undefined;
    const noSequenceId = isUndefined(sequenceIdInput) || isNaN(sequenceIdInput);
    if (isUndefined(bindingType)
      || (noSequenceId && isUndefined(specialActionInput))) {
      error(t("Please select a sequence or action."));
      return false;
    }
    const body = pinBindingBody(bindingType == PinBindingType.special
      ? {
        pin_num: pinNumber,
        special_action: specialActionInput,
        binding_type: bindingType
      }
      : {
        pin_num: pinNumber,
        sequence_id: sequenceIdInput,
        binding_type: bindingType
      });
    if (bindingUuid) {
      const binding = findByUuid(resources, bindingUuid);
      const newBody = cloneDeep(binding.body as PinBinding);
      newBody.binding_type = bindingType;
      if (bindingType == PinBindingType.standard && sequenceIdInput) {
        (newBody as StandardPinBinding).sequence_id = sequenceIdInput;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newBody as any).special_action = undefined;
      }
      if (bindingType == PinBindingType.special && specialActionInput) {
        (newBody as SpecialPinBinding).special_action = specialActionInput;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newBody as any).sequence_id = undefined;
      }
      dispatch(overwrite(binding, newBody));
      dispatch(save(binding.uuid));
    } else {
      dispatch(initSave("PinBinding", body));
    }
    return true;
  };

export const findBinding = (resources: ResourceIndex) => (pin: number) =>
  apiPinBindings(resources).filter(b => b.pin_number == pin)[0];

export const triggerBinding =
  (resources: ResourceIndex, botOnline: boolean) =>
    (pin: number) =>
      () => {
        const binding = findBinding(resources)(pin);
        if (!botOnline || !binding) { return; }
        if (binding.sequence_id) {
          execSequence(binding.sequence_id);
        }
        if (binding.special_action) {
          sendRPC({
            kind: binding.special_action, args: {},
          } as RpcRequestBodyItem);
        }
      };
