import React from "react";
import { t } from "../i18next_wrapper";
import { Row } from "../ui";
import { FirmwareNumberSettingsProps } from "./interfaces";
import { sourceFwConfigValue } from "../settings/source_config_value";
import { validFwConfig } from "../util";
import { getFbosConfig, getFirmwareConfig } from "../resources/getters";
import { getFwHardwareValue } from "../settings/firmware/firmware_hardware_support";
import { McuInputBox } from "../settings/hardware_settings/mcu_input_box";
import { calculateScale } from "../settings/hardware_settings";

export class Video extends React.Component<{ url: string }> {
  shouldComponentUpdate = () => false;
  render() {
    const { url } = this.props;
    return <iframe key={url} src={url + "&cc_load_policy=1"}
      frameBorder={0} width={"100%"} allowFullScreen={true} />;
  }
}

export const FirmwareNumberSettings = (props: FirmwareNumberSettingsProps) => {
  const sourceFwConfig = sourceFwConfigValue(
    validFwConfig(getFirmwareConfig(props.resources)),
    props.bot.hardware.mcu_params);
  return <div className={"motor-settings"}>
    {props.firmwareNumberSettings?.map(setting =>
      <Row key={setting.key} className="grid-2-col">
        <label>{t(setting.label)}</label>
        <McuInputBox
          dispatch={props.dispatch}
          sourceFwConfig={sourceFwConfig}
          firmwareHardware={getFwHardwareValue(getFbosConfig(
            props.resources))}
          scale={setting.scale
            ? calculateScale(sourceFwConfig)[setting.scale]
            : undefined}
          intSize={setting.intSize}
          inputMax={setting.inputMax}
          toInput={setting.toInput}
          fromInput={setting.fromInput}
          setting={setting.key} />
      </Row>)}
  </div>;
};
