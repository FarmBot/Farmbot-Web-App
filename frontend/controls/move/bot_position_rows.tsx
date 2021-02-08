import React from "react";
import { Row, Col } from "../../ui";
import { Feature } from "../../devices/interfaces";
import { commandErr, moveAbsolute } from "../../devices/actions";
import { AxisDisplayGroup } from "../axis_display_group";
import { AxisInputBoxGroup } from "../axis_input_box_group";
import { BooleanSetting } from "../../session_keys";
import { t } from "../../i18next_wrapper";
import { hasEncoders } from "../../settings/firmware/firmware_hardware_support";
import { CONFIG_DEFAULTS } from "farmbot/dist/config";
import { LockableButton } from "../../settings/hardware_settings/lockable_button";
import { getDevice } from "../../device";
import { Popover, Position } from "@blueprintjs/core";
import {
  disabledAxisMap,
} from "../../settings/hardware_settings/axis_tracking_status";
import { push } from "../../history";
import { AxisActionsProps, BotPositionRowsProps } from "./interfaces";

export const BotPositionRows = (props: BotPositionRowsProps) => {
  const { locationData, getValue, arduinoBusy } = props;
  const hardwareDisabled = disabledAxisMap(props.firmwareSettings);
  const commonAxisActionProps = {
    botOnline: props.botOnline,
    shouldDisplay: props.shouldDisplay,
    arduinoBusy,
  };
  return <div className={"bot-position-rows"}>
    <div className={"axis-titles"}>
      <Row>
        <Col xs={3}>
          <label>{t("X AXIS")}</label>
          <AxisActions axis={"x"}
            hardwareDisabled={hardwareDisabled.x}
            {...commonAxisActionProps} />
        </Col>
        <Col xs={3}>
          <label>{t("Y AXIS")}</label>
          <AxisActions axis={"y"}
            hardwareDisabled={hardwareDisabled.y}
            {...commonAxisActionProps} />
        </Col>
        <Col xs={3}>
          <label>{t("Z AXIS")}</label>
          <AxisActions axis={"z"}
            hardwareDisabled={hardwareDisabled.z}
            {...commonAxisActionProps} />
        </Col>
      </Row>
    </div>
    <AxisDisplayGroup
      position={locationData.position}
      firmwareSettings={props.firmwareSettings}
      missedSteps={locationData.load}
      axisStates={locationData.axis_states}
      busy={arduinoBusy}
      style={{ overflowWrap: "break-word" }}
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
      onCommit={moveAbsolute}
      disabled={arduinoBusy} />
  </div>;
};

export const AxisActions = (props: AxisActionsProps) => {
  const { axis, arduinoBusy, hardwareDisabled, botOnline } = props;
  return <Popover position={Position.BOTTOM_RIGHT} usePortal={false}>
    <i className="fa fa-ellipsis-v" />
    <div className={"axis-actions"}>
      {props.shouldDisplay(Feature.home_single_axis) &&
        <LockableButton
          disabled={arduinoBusy || !botOnline}
          title={t("MOVE TO HOME")}
          onClick={() => getDevice()
            .home({ speed: CONFIG_DEFAULTS.speed, axis })
            .catch(commandErr("Move to home"))}>
          {t("MOVE TO HOME")}
        </LockableButton>}
      <LockableButton
        disabled={arduinoBusy || hardwareDisabled || !botOnline}
        title={t("FIND HOME")}
        onClick={() => getDevice()
          .findHome({ speed: CONFIG_DEFAULTS.speed, axis })
          .catch(commandErr("Find Home"))}>
        {t("FIND HOME")}
      </LockableButton>
      <LockableButton
        disabled={arduinoBusy || !botOnline}
        title={t("SET HOME")}
        onClick={() => getDevice().setZero(axis)
          .catch(commandErr("Set home"))}>
        {t("SET HOME")}
      </LockableButton>
      <LockableButton
        disabled={arduinoBusy || hardwareDisabled || !botOnline}
        title={t("FIND LENGTH")}
        onClick={() => getDevice().calibrate({ axis })
          .catch(commandErr("Find axis length"))}>
        {t("FIND LENGTH")}
      </LockableButton>
      <a onClick={() => push("/app/designer/settings?highlight=axes")}>
        <i className="fa fa-external-link" />
        {t("Settings")}
      </a>
    </div>
  </Popover>;
};
