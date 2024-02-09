import React from "react";
import { t } from "../../i18next_wrapper";
import { Row, Col, Help } from "../../ui";
import { DeviceSetting, ToolTips } from "../../constants";
import { Highlight } from "../maybe_highlight";
import { BotConfigInputBox } from "./bot_config_input_box";
import { ZHeightInputProps } from "./interfaces";
import {
  validFirmwareHardware,
} from "../firmware/firmware_hardware_support";
import { getDefaultConfigValue } from "./default_values";

export const GantryHeight = (props: ZHeightInputProps) => {
  const { sourceFbosConfig } = props;
  const firmwareHardware = validFirmwareHardware(
    sourceFbosConfig("firmware_hardware").value);
  const defaultValue =
    getDefaultConfigValue(firmwareHardware)("gantry_height") as number;
  return <Highlight settingName={DeviceSetting.gantryHeight}>
    <Row>
      <Col xs={8}>
        <label>
          {t(DeviceSetting.gantryHeight)}
        </label>
        <Help text={t(ToolTips.GANTRY_HEIGHT, { distance: defaultValue })}
          enableMarkdown={true} />
      </Col>
      <Col xs={4} className={"z-height-input low-pad"}>
        <BotConfigInputBox
          setting={"gantry_height"}
          dispatch={props.dispatch}
          sourceFbosConfig={sourceFbosConfig} />
      </Col>
    </Row>
  </Highlight>;
};

export const SafeHeight = (props: ZHeightInputProps) =>
  <Highlight settingName={DeviceSetting.safeHeight}>
    <Row>
      <Col xs={8}>
        <label>
          {t(DeviceSetting.safeHeight)}
        </label>
        <Help text={ToolTips.SAFE_HEIGHT} />
      </Col>
      <Col xs={4} className={"z-height-input low-pad"}>
        <BotConfigInputBox
          setting={"safe_height"}
          dispatch={props.dispatch}
          sourceFbosConfig={props.sourceFbosConfig} />
      </Col>
    </Row>
  </Highlight>;

export const SoilHeight = (props: ZHeightInputProps) =>
  <Highlight settingName={DeviceSetting.fallbackSoilHeight}>
    <Row>
      <Col xs={8}>
        <label>
          {t(DeviceSetting.fallbackSoilHeight)}
        </label>
        <Help text={ToolTips.FALLBACK_SOIL_HEIGHT} />
      </Col>
      <Col xs={4} className={"z-height-input low-pad"}>
        <BotConfigInputBox
          setting={"soil_height"}
          dispatch={props.dispatch}
          sourceFbosConfig={props.sourceFbosConfig} />
      </Col>
    </Row>
  </Highlight>;
