import React from "react";
import {
  bindingTypeLabelLookup,
  generatePinLabel, sortByNameAndPin, getSpecialActionLabel,
} from "./list_and_label_support";
import { destroy } from "../../api/crud";
import { error } from "../../toast/toast";
import { Row } from "../../ui";
import { findSequenceById } from "../../resources/selectors";
import { PinBindingsListProps } from "./interfaces";
import { sysBtnBindings } from "./tagged_pin_binding_init";
import { t } from "../../i18next_wrapper";
import {
  PinBindingType, PinBindingSpecialAction,
} from "farmbot/dist/resources/api_resources";

export const PinBindingsList = (props: PinBindingsListProps) => {
  const { pinBindings, resources, dispatch } = props;

  const deleteBinding = (pin: number, uuid?: string) => {
    if (!sysBtnBindings.includes(pin)) {
      dispatch(destroy(uuid || ""));
    } else {
      error(t("Cannot delete built-in pin binding."));
    }
  };

  const delBtnColor = (pin: number) =>
    sysBtnBindings.includes(pin) ? "pseudo-disabled" : "red";

  const bindingText = (
    sequence_id: number | undefined,
    binding_type: PinBindingType | undefined,
    special_action: PinBindingSpecialAction | undefined,
  ) =>
    `${t(bindingTypeLabelLookup()[binding_type || ""])}: ${(sequence_id
      ? findSequenceById(resources, sequence_id).body.name
      : t(getSpecialActionLabel(special_action)))}`;

  return <div className={"bindings-list grid"}>
    {pinBindings
      .sort((a, b) => sortByNameAndPin(a.pin_number, b.pin_number))
      .map(x => {
        const { pin_number, sequence_id, binding_type, special_action } = x;
        const binding = bindingText(sequence_id, binding_type, special_action);
        return <Row key={`pin_${pin_number}_binding`} className="row pin-binding-grid">
          <p>{generatePinLabel(pin_number)}</p>
          <p className="binding-action">{binding}</p>
          <button
            className={`fb-button ${delBtnColor(pin_number)}`}
            title={t("Delete")}
            onClick={() => deleteBinding(pin_number, x.uuid)}>
            <i className="fa fa-times" />
          </button>
        </Row>;
      })}
  </div>;
};
