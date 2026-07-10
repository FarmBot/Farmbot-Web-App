import React from "react";
import {
  ALLOWED_PIN_MODES, TaggedPeripheral, TaggedSensor, TaggedTool,
} from "farmbot";
import { t } from "../i18next_wrapper";
import { ToggleButton } from "../ui";
import { pinToggle, readPin } from "../devices/actions";
import { isNumber } from "lodash";
import {
  reduceToolName, ToolName,
} from "../farm_designer/map/tool_graphics/all_tools";
import { PeripheralValues } from
  "../farm_designer/map/layers/farmbot/bot_trail";

export interface ToolActionRowProps {
  mountedTool: TaggedTool | undefined;
  sensors: TaggedSensor[];
  peripherals: TaggedPeripheral[];
  peripheralValues: PeripheralValues;
  botOnline: boolean;
  arduinoBusy: boolean;
  locked: boolean;
  className?: string;
}

interface PeripheralToggleProps extends ToolActionRowProps {
  label: string;
  peripheral: TaggedPeripheral | undefined;
}

const PeripheralToggle = (props: PeripheralToggleProps) => {
  const pin = props.peripheral?.body.pin;
  const value = props.peripheral
    ? props.peripheralValues.find(peripheral =>
      peripheral.label == props.peripheral?.body.label)?.value
    : undefined;
  return <div className={"tool-peripheral-action row half-gap"}>
    <span>{t(props.label)}</span>
    <ToggleButton
      toggleValue={value}
      toggleAction={() => { if (isNumber(pin)) { void pinToggle(pin); } }}
      disabled={!isNumber(pin) || !props.botOnline
        || props.arduinoBusy || props.locked}
      title={t("Toggle {{peripheral}}", { peripheral: props.label })}
      customText={{ textFalse: t("off"), textTrue: t("on") }} />
  </div>;
};

export const ToolActionRow = (props: ToolActionRowProps) => {
  const toolName = reduceToolName(props.mountedTool?.body.name);
  const findPeripheral = (matches: (label: string) => boolean) =>
    props.peripherals.find(peripheral =>
      matches(peripheral.body.label.toLowerCase()));
  const vacuum = findPeripheral(label => label.includes("vacuum"));
  const rotaryReverse = findPeripheral(label =>
    label.includes("rotary") && label.includes("reverse"));
  const rotary = findPeripheral(label =>
    label.includes("rotary") && !label.includes("reverse"));
  const water = findPeripheral(label => label.includes("water"));
  const soilSensor = props.sensors.find(sensor =>
    sensor.body.label.toLowerCase().includes("soil"));
  const readSoilSensor = () => {
    const pin = soilSensor?.body.pin;
    if (soilSensor && isNumber(pin)) {
      readPin(pin, `pin${pin}`,
        soilSensor.body.mode as ALLOWED_PIN_MODES);
    }
  };
  let action: React.ReactNode;
  switch (toolName) {
    case ToolName.soilSensor:
      action = <button className={"fb-button gray"}
        type={"button"}
        disabled={!isNumber(soilSensor?.body.pin)
          || !props.botOnline || props.arduinoBusy || props.locked}
        onClick={readSoilSensor}>
        {t("Read sensor")}
      </button>;
      break;
    case ToolName.seeder:
      action = <PeripheralToggle {...props}
        label={"Vacuum"} peripheral={vacuum} />;
      break;
    case ToolName.rotaryTool:
      action = <div className={"tool-action-buttons row half-gap"}>
        <PeripheralToggle {...props} label={"FWD"} peripheral={rotary} />
        <PeripheralToggle {...props} label={"REV"}
          peripheral={rotaryReverse} />
      </div>;
      break;
    case ToolName.wateringNozzle:
      action = <PeripheralToggle {...props}
        label={"Water"} peripheral={water} />;
      break;
    default:
      return undefined;
  }
  const className = [
    "tool-action-row row grid-exp-1",
    props.className,
  ].filter(Boolean).join(" ");
  return <div className={className}>
    <label>{t("TOOL ACTION")}</label>
    {action}
  </div>;
};
