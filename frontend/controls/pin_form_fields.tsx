import React from "react";
import { edit } from "../api/crud";
import { FBSelect } from "../ui";
import { pinDropdowns, getPinModes } from "../sequences/step_tiles/pin_support";
import { t } from "../i18next_wrapper";
import { TaggedPeripheral, TaggedSensor } from "farmbot";
import { isNumber } from "lodash";
import {
  PeripheralType, SensorType,
} from "farmbot/dist/resources/api_resources";

type PinType = PeripheralType | SensorType;

const PIN_TYPE_INFO: Record<PinType, { emoji: string; label: string }> = {
  lighting: { emoji: "💡", label: "Lighting" },
  rotary_tool: { emoji: "꩜", label: "Rotary Tool" },
  vacuum: { emoji: "💨", label: "Vacuum" },
  water: { emoji: "💧", label: "Water" },
  soil_moisture: { emoji: "💧", label: "Soil Moisture" },
  tool_verification: { emoji: "🔧", label: "Tool Verification" },
  current: { emoji: "⚡", label: "Current" },
  none: { emoji: "", label: "None" },
};

interface PinTypeEmojiProps {
  type: PinType | undefined;
}

export const PinTypeEmoji = (props: PinTypeEmojiProps) => {
  const info = props.type ? PIN_TYPE_INFO[props.type] : undefined;
  const label = info ? t(info.label) : undefined;
  return <span className={"pin-type-emoji"}
    role={info ? "img" : undefined}
    aria-label={label}
    title={label}>
    {info?.emoji}
  </span>;
};

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
    name="pinName"
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
      ? { label: t("Pin ") + `${props.value}`, value: props.value }
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
    list={getPinModes()} />;
