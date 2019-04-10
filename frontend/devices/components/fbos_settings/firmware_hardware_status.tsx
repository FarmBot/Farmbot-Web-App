import * as React from "react";
import { Popover, Position } from "@blueprintjs/core";
import { FIRMWARE_CHOICES_DDI } from "./board_type";

export interface FirmwareHardwareStatusIconProps {
  firmwareHardware: string | undefined;
  ok: boolean;
}

export const FirmwareHardwareStatusIcon =
  (props: FirmwareHardwareStatusIconProps) => {
    const okNoStatus = props.ok ? "ok" : "no";
    const status = props.firmwareHardware ? okNoStatus : "unknown";
    const okNoIcon = props.ok ? "fa-check-circle" : "fa-times-circle";
    const icon = props.firmwareHardware ? okNoIcon : "fa-question-circle";
    return <i className={`fa ${icon} status-icon ${status}`} title={status} />;
  };

const lookup = (value: string | undefined) =>
  value && Object.keys(FIRMWARE_CHOICES_DDI).includes(value)
    ? FIRMWARE_CHOICES_DDI[value].label : undefined;

export interface FirmwareHardwareStatusDetailsProps
  extends FirmwareHardwareStatusProps {
  status: boolean;
}

export const FirmwareHardwareStatusDetails =
  (props: FirmwareHardwareStatusDetailsProps) =>
    <div>
      <label>{"API"}</label>
      <p>{`${props.apiFirmwareValue}: ${lookup(props.apiFirmwareValue)}`}</p>
      <label>{"FBOS"}</label>
      <p>{`${props.botFirmwareValue}: ${lookup(props.botFirmwareValue)}`}</p>
      <label>{"MCU"}</label>
      <p>{`${props.mcuFirmwareVersion}: ${lookup(props.mcuFirmwareValue)}`}</p>
      <label>{"STATUS"}</label>
      <p>{props.status ? "consistent" : "inconsistent"}</p>
    </div>;

interface FirmwareHardwareStatusProps {
  apiFirmwareValue: string | undefined;
  botFirmwareValue: string | undefined;
  mcuFirmwareVersion: string | undefined;
  mcuFirmwareValue: string | undefined;
}

export const FirmwareHardwareStatus = (props: FirmwareHardwareStatusProps) => {
  const status = props.apiFirmwareValue == props.botFirmwareValue &&
    props.apiFirmwareValue == props.mcuFirmwareValue;
  return <Popover position={Position.BOTTOM}>
    <FirmwareHardwareStatusIcon
      firmwareHardware={props.botFirmwareValue}
      ok={status} />
    <FirmwareHardwareStatusDetails status={status} {...props} />
  </Popover>;
};
