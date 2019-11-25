import * as React from "react";
import { edit } from "../api/crud";
import { FBSelect } from "../ui";
import {
  pinDropdowns
} from "../sequences/step_tiles/pin_and_peripheral_support";
import { PIN_MODES } from "../sequences/step_tiles/tile_pin_support";
import { t } from "../i18next_wrapper";
import { TaggedPeripheral, TaggedSensor } from "farmbot";
import { isNumber } from "lodash";

const MODES = (): { [s: string]: string } => ({
  0: t("Digital"),
  1: t("Analog")
});

interface NameInputBoxProps {
  dispatch: Function;
  value: string | undefined;
  resource: TaggedPeripheral | TaggedSensor;
}

export const NameInputBox = (props: NameInputBoxProps) =>
  <input type="text"
    placeholder={t("Name")}
    value={props.value}
    onChange={e => props.dispatch(edit(props.resource, {
      label: e.currentTarget.value
    }))} />;

interface PinDropdownProps {
  dispatch: Function;
  value: number | undefined;
  resource: TaggedPeripheral | TaggedSensor;
}

export const PinDropdown = (props: PinDropdownProps) =>
  <FBSelect
    selectedItem={isNumber(props.value)
      ? { label: t("Pin ") + `${props.value}`, value: props.value || "" }
      : { label: t("Select a pin "), value: "" }}
    onChange={d => props.dispatch(edit(props.resource, {
      pin: parseInt(d.value.toString(), 10)
    }))}
    list={pinDropdowns(n => n)} />;

interface ModeDropdownProps {
  dispatch: Function;
  value: number;
  resource: TaggedPeripheral | TaggedSensor;
}

export const ModeDropdown = (props: ModeDropdownProps) =>
  <FBSelect
    onChange={d => props.dispatch(edit(props.resource, {
      mode: parseInt(d.value.toString(), 10)
    }))}
    selectedItem={{ label: MODES()[props.value], value: props.value }}
    list={PIN_MODES()} />;
