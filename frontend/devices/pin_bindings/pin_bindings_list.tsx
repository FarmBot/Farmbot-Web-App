import * as React from "react";
import {
  bindingTypeLabelLookup,
  generatePinLabel, sortByNameAndPin, getSpecialActionLabel,
} from "./list_and_label_support";
import { destroy } from "../../api/crud";
import { error } from "../../toast/toast";
import { Row, Col } from "../../ui";
import { findSequenceById } from "../../resources/selectors";
import { PinBindingColWidth } from "./pin_bindings";
import { PinBindingsListProps } from "./interfaces";
import { sysBtnBindings } from "./tagged_pin_binding_init";
import { t } from "../../i18next_wrapper";
import { DevSettings } from "../../account/dev/dev_support";
import {
  PinBindingType, PinBindingSpecialAction,
} from "farmbot/dist/resources/api_resources";
import { DeviceSetting } from "../../constants";

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
    `${t(bindingTypeLabelLookup[binding_type || ""])}: ${(sequence_id
      ? findSequenceById(resources, sequence_id).body.name
      : t(getSpecialActionLabel(special_action)))}`;

  const newFormat = DevSettings.futureFeature1Enabled();
  return <div className={"bindings-list"}>
    {newFormat && <Row><label>{t(DeviceSetting.savedPinBindings)}</label></Row>}
    {pinBindings
      .sort((a, b) => sortByNameAndPin(a.pin_number, b.pin_number))
      .map(x => {
        const { pin_number, sequence_id, binding_type, special_action } = x;
        const binding = bindingText(sequence_id, binding_type, special_action);
        return <Row key={`pin_${pin_number}_binding`}>
          <Col xs={newFormat ? 11 : PinBindingColWidth.pin}>
            <p>{generatePinLabel(pin_number)}</p>
            <p className="binding-action">{newFormat && binding}</p>
          </Col>
          {!newFormat &&
            <Col xs={PinBindingColWidth.type}>
              {binding}
            </Col>}
          <Col xs={newFormat ? 1 : PinBindingColWidth.button}>
            <button
              className={`fb-button ${delBtnColor(pin_number)} del-button`}
              title={t("Delete")}
              onClick={() => deleteBinding(pin_number, x.uuid)}>
              <i className="fa fa-times" />
            </button>
          </Col>
        </Row>;
      })}
  </div>;
};
