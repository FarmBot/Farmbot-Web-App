import React from "react";
import { Row, FBSelect, DropDownItem, Popover, Help } from "../../ui";
import { DeviceSetting, ToolTips } from "../../constants";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { edit, save } from "../../api/crud";
import { FirmwareHardware, TaggedDevice } from "farmbot";
import { BotState } from "../../devices/interfaces";
import { StatusIcon } from "../firmware/firmware_hardware_status";
import { Position } from "@blueprintjs/core";
import { hasZero2 } from "../firmware/firmware_hardware_support";

export const RPI_OPTIONS: Record<string, DropDownItem> = {
  "3": { label: "Raspberry Pi 3", value: "3" },
  "4": { label: "Raspberry Pi 4", value: "4" },
  "01": { label: "Raspberry Pi Zero W", value: "01" },
  "02": { label: "Raspberry Pi Zero 2 W", value: "02" },
};

const TARGETS =
  (firmwareHardware: FirmwareHardware | undefined): { [x: string]: string } => ({
    "rpi3": hasZero2(firmwareHardware)
      ? "Raspberry Pi Zero 2 W"
      : "Raspberry Pi 3",
    "rpi4": "Raspberry Pi 4",
    "rpi": "Raspberry Pi Zero W",
  });

export interface RpiModelProps {
  dispatch: Function;
  firmwareHardware: FirmwareHardware | undefined;
  device: TaggedDevice;
  bot: BotState;
  showAdvanced: boolean;
}

export const RpiModel = (props: RpiModelProps) => {
  const selection = props.device.body.rpi;
  const check = (rpi: string | undefined, target: string) => {
    switch (rpi) {
      case "02":
      case "3": return target == "rpi3";
      case "4": return target == "rpi4";
      case "01": return target == "rpi";
      default: return false;
    }
  };
  const { target } = props.bot.hardware.informational_settings;
  return <Highlight settingName={DeviceSetting.raspberryPiModel}
    hidden={!props.showAdvanced}
    className={"advanced"}>
    <Row className="grid-2-col">
      <div className="row grid-exp-2">
        <label>
          {t("Raspberry Pi model")}
        </label>
        <Popover position={Position.TOP}
          target={<StatusIcon available={!!target && target != "---"}
            status={check(selection, target)} />}
          content={<StatusDetails selection={selection} target={target}
            firmwareHardware={props.firmwareHardware} />} />
      </div>
      <FBSelect
        key={selection}
        list={Object.values(RPI_OPTIONS)}
        selectedItem={RPI_OPTIONS["" + selection]}
        onChange={ddi => {
          props.dispatch(edit(props.device, { rpi: "" + ddi.value }));
          props.dispatch(save(props.device.uuid));
        }} />
    </Row>
  </Highlight>;
};

export interface StatusDetailsProps {
  selection: string | undefined;
  target: string;
  firmwareHardware: FirmwareHardware | undefined;
}

export const StatusDetails = (props: StatusDetailsProps) => {
  const { selection, target, firmwareHardware } = props;
  return <div className={"status-details"}>
    <label>{t("Web App")}</label>
    <Help text={ToolTips.RPI_VALUE_API} />
    <p>{selection ? RPI_OPTIONS[selection].label : t("none")}</p>
    <label>{t("FarmBot OS")}</label>
    <Help text={ToolTips.RPI_VALUE_FBOS} />
    <p>{TARGETS(firmwareHardware)["" + target] || t("unknown")}</p>
  </div>;
};
