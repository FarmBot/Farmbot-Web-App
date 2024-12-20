import React from "react";
import { t } from "../../../i18next_wrapper";
import { ConfigurationName, McuParams, TaggedPoint } from "farmbot";
import { BotLocationData, SourceFbosConfig } from "../../../devices/interfaces";
import { BotSize } from "../interfaces";
import { MarkedSlider, ToggleButton } from "../../../ui";
import { ceil, round } from "lodash";
import { soilHeightPoint } from "../../../points/soil_height";

export interface ZDisplayToggleProps {
  open: boolean;
  setOpen(open: boolean): void;
}

export const ZDisplayToggle = (props: ZDisplayToggleProps) =>
  <div className={"z-display-toggle"}>
    <fieldset>
      <label>{t("z")}</label>
      <ToggleButton toggleValue={props.open}
        title={props.open ? t("hide z display") : t("show z display")}
        customText={{ textTrue: "", textFalse: "" }}
        toggleAction={() => props.setOpen(!props.open)} />
    </fieldset>
  </div>;

export interface ZDisplayProps {
  allPoints: TaggedPoint[];
  botLocationData: BotLocationData;
  botSize: BotSize;
  firmwareConfig: McuParams;
  sourceFbosConfig: SourceFbosConfig;
}

export const ZDisplay = (props: ZDisplayProps) => {
  const tools = props.allPoints.filter(p => p.body.pointer_type == "ToolSlot")
    .map(p => p.body.z).sort()[0];
  const soil = props.allPoints.filter(soilHeightPoint)
    .map(p => p.body.z).sort()[0];
  const values = props.allPoints.filter(p => soilHeightPoint(p) || p.body.z != 0)
    .map(p => Math.abs(p.body.z));
  const soilHeight = getFbosZValue(props.sourceFbosConfig, "soil_height");
  const safeHeight = getFbosZValue(props.sourceFbosConfig, "safe_height");
  values.push(soilHeight);
  values.push(safeHeight);
  const zPosition = Math.abs(props.botLocationData.position.z || 0);
  const max = ceil(Math.max(zPosition, props.botSize.z.value, ...values), -2);
  return <div className={"z-display"}>
    <label>{"z"}</label>
    <MarkedSlider<number>
      vertical={true}
      min={0}
      max={max + 1}
      labelStepSize={100}
      value={max - zPosition}
      labelRenderer={value => props.firmwareConfig.movement_home_up_z
        ? round(value - max).toString()
        : round(max - value).toString()}
      items={values}
      itemValue={value => max - value}
      itemLabelRenderer={value => {
        if ((value - max) == tools) { return t("slots"); }
        if ((value - max) == soil) { return t("soil"); }
        if (Math.abs(value - max) == safeHeight) { return t("safe"); }
        if (Math.abs(value - max) == soilHeight) { return t("soil"); }
        return "";
      }} />
  </div>;
};

export const getFbosZValue =
  (sourceFbosConfig: SourceFbosConfig, key: ConfigurationName) =>
    Math.abs(parseInt("" + (sourceFbosConfig(key).value || 0)));
