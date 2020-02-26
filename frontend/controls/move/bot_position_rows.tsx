import * as React from "react";
import { Row, Col } from "../../ui";
import { BotLocationData } from "../../devices/interfaces";
import { moveAbs } from "../../devices/actions";
import { AxisDisplayGroup } from "../axis_display_group";
import { AxisInputBoxGroup } from "../axis_input_box_group";
import { GetWebAppBool } from "./interfaces";
import { BooleanSetting } from "../../session_keys";
import { t } from "../../i18next_wrapper";
import { hasEncoders } from "../../devices/components/firmware_hardware_support";
import { FirmwareHardware } from "farmbot";

export interface BotPositionRowsProps {
  locationData: BotLocationData;
  getValue: GetWebAppBool;
  arduinoBusy: boolean;
  firmwareHardware: FirmwareHardware | undefined;
}

export const BotPositionRows = (props: BotPositionRowsProps) => {
  const { locationData, getValue, arduinoBusy } = props;
  return <div>
    <Row>
      <Col xs={3}>
        <label>{t("X AXIS")}</label>
      </Col>
      <Col xs={3}>
        <label>{t("Y AXIS")}</label>
      </Col>
      <Col xs={3}>
        <label>{t("Z AXIS")}</label>
      </Col>
    </Row>
    <AxisDisplayGroup
      position={locationData.position}
      label={t("Motor Coordinates (mm)")} />
    {hasEncoders(props.firmwareHardware) &&
      getValue(BooleanSetting.scaled_encoders) &&
      <AxisDisplayGroup
        position={locationData.scaled_encoders}
        label={t("Scaled Encoder (mm)")} />}
    {hasEncoders(props.firmwareHardware) &&
      getValue(BooleanSetting.raw_encoders) &&
      <AxisDisplayGroup
        position={locationData.raw_encoders}
        label={t("Raw Encoder data")} />}
    <AxisInputBoxGroup
      position={locationData.position}
      onCommit={moveAbs}
      disabled={arduinoBusy} />
  </div>;
};
