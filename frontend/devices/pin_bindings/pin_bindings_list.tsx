import * as React from "react";
import {
  bindingTypeLabelLookup, specialActionLabelLookup,
  generatePinLabel, sortByNameAndPin
} from "./list_and_label_support";
import { destroy } from "../../api/crud";
import { error } from "../../toast/toast";
import { Row, Col } from "../../ui";
import { findSequenceById } from "../../resources/selectors";
import { PinBindingColWidth } from "./pin_bindings";
import { PinBindingsListProps } from "./interfaces";
import { sysBtnBindings } from "./tagged_pin_binding_init";
import { t } from "../../i18next_wrapper";

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

  return <div className={"bindings-list"}>
    {pinBindings
      .sort((a, b) => sortByNameAndPin(a.pin_number, b.pin_number))
      .map(x => {
        const { pin_number, sequence_id, binding_type, special_action } = x;
        return <Row key={`pin_${pin_number}_binding`}>
          <Col xs={PinBindingColWidth.pin}>
            {generatePinLabel(pin_number)}
          </Col>
          <Col xs={PinBindingColWidth.type}>
            {t(bindingTypeLabelLookup[binding_type || ""])}
          </Col>
          <Col xs={PinBindingColWidth.target}>
            {sequence_id
              ? findSequenceById(resources, sequence_id).body.name
              : t(specialActionLabelLookup[special_action || ""])}
          </Col>
          <Col xs={PinBindingColWidth.button}>
            <button
              className={`fb-button ${delBtnColor(pin_number)}`}
              onClick={() => deleteBinding(pin_number, x.uuid)}>
              <i className="fa fa-times" />
            </button>
          </Col>
        </Row>;
      })}
  </div>;
};
