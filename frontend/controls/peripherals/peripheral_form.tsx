import React from "react";
import { PeripheralFormProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { FBSelect, Row } from "../../ui";
import { DeleteButton } from "../../ui/delete_button";
import { NameInputBox, PinDropdown, ModeDropdown } from "../pin_form_fields";
import { edit } from "../../api/crud";
import { t } from "../../i18next_wrapper";
import { TaggedPeripheral } from "farmbot";
import { PeripheralType } from "farmbot/dist/resources/api_resources";

export const PERIPHERAL_TYPE_CHOICES = (): {
  label: string;
  value: PeripheralType;
}[] => [
  { label: t("Lighting"), value: "lighting" },
  { label: t("Rotary Tool"), value: "rotary_tool" },
  { label: t("Vacuum"), value: "vacuum" },
  { label: t("Water"), value: "water" },
  { label: t("None"), value: "none" },
];

interface PeripheralTypeDropdownProps {
  dispatch: Function;
  peripheral: TaggedPeripheral;
}

export const PeripheralTypeDropdown = (
  props: PeripheralTypeDropdownProps,
) => {
  const choices = PERIPHERAL_TYPE_CHOICES();
  return <FBSelect
    list={choices}
    selectedItem={choices.find(choice =>
      choice.value == props.peripheral.body.type)}
    onChange={choice => props.dispatch(edit(props.peripheral, {
      type: choice.value as PeripheralType,
    }))} />;
};

export const PeripheralForm = (props: PeripheralFormProps) =>
  <div className="peripheral-form grid">
    {sortResourcesById(props.peripherals).map(peripheral =>
      <Row key={peripheral.uuid} className="peripheral-edit-grid">
        <NameInputBox
          dispatch={props.dispatch}
          value={peripheral.body.label}
          resource={peripheral} />
        <PinDropdown
          dispatch={props.dispatch}
          value={peripheral.body.pin}
          resource={peripheral} />
        <ModeDropdown
          dispatch={props.dispatch}
          value={peripheral.body.mode}
          resource={peripheral} />
        <PeripheralTypeDropdown
          dispatch={props.dispatch}
          peripheral={peripheral} />
        <DeleteButton
          dispatch={props.dispatch}
          uuid={peripheral.uuid} />
      </Row>)}
  </div>;
