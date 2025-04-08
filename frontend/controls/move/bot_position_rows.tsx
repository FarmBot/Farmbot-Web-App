import React from "react";
import { Row, Popover } from "../../ui";
import {
  findAxisLength, findHome, moveAbsolute, moveToHome, setHome, updateMCU,
} from "../../devices/actions";
import { AxisDisplayGroup } from "../axis_display_group";
import { AxisInputBoxGroup } from "../axis_input_box_group";
import { BooleanSetting } from "../../session_keys";
import { t } from "../../i18next_wrapper";
import { hasEncoders } from "../../settings/firmware/firmware_hardware_support";
import { LockableButton } from "../../settings/hardware_settings/lockable_button";
import { Position } from "@blueprintjs/core";
import {
  disabledAxisMap,
} from "../../settings/hardware_settings/axis_tracking_status";
import { useNavigate } from "react-router";
import {
  AxisActionsProps, BotPositionRowsProps, SetAxisLengthProps,
} from "./interfaces";
import { lockedClass } from "../locked_class";
import { Path } from "../../internal_urls";
import { Xyz } from "farmbot";
import { BotPosition } from "../../devices/interfaces";
import {
  setMovementState, setMovementStateFromPosition,
} from "../../connectivity/log_handlers";
import { NumberConfigKey } from "farmbot/dist/resources/configs/firmware";
import { isUndefined } from "lodash";
import { calculateScale } from "../../settings/hardware_settings";
import { setPanelOpen } from "../../farm_designer/panel_header";

export const BotPositionRows = (props: BotPositionRowsProps) => {
  const { locationData, getConfigValue, arduinoBusy, locked } = props;
  const hardwareDisabled = disabledAxisMap(props.firmwareSettings);
  const commonAxisActionProps = {
    botOnline: props.botOnline,
    arduinoBusy,
    locked,
    dispatch: props.dispatch,
    botPosition: locationData.position,
    sourceFwConfig: props.sourceFwConfig,
  };
  const showCurrentPosition = props.showCurrentPosition
    || (hasEncoders(props.firmwareHardware) &&
      (getConfigValue(BooleanSetting.scaled_encoders)
        || getConfigValue(BooleanSetting.raw_encoders)));
  return <div className={"bot-position-rows grid"}>
    <div className={"axis-titles"}>
      <Row className="grid-4-col">
        <div className="row grid-exp-1">
          <label>{t("X AXIS")}</label>
          <AxisActions axis={"x"}
            hardwareDisabled={hardwareDisabled.x}
            {...commonAxisActionProps} />
        </div>
        <div className="row grid-exp-1">
          <label>{t("Y AXIS")}</label>
          <AxisActions axis={"y"}
            hardwareDisabled={hardwareDisabled.y}
            {...commonAxisActionProps} />
        </div>
        <div className="row grid-exp-1">
          <label>{t("Z AXIS")}</label>
          <AxisActions axis={"z"}
            hardwareDisabled={hardwareDisabled.z}
            {...commonAxisActionProps} />
        </div>
      </Row>
    </div>
    <AxisDisplayGroup
      noValues={!showCurrentPosition}
      position={locationData.position}
      firmwareSettings={props.firmwareSettings}
      missedSteps={locationData.load}
      axisStates={locationData.axis_states}
      busy={arduinoBusy}
      style={{ overflowWrap: "break-word" }}
      label={t("Position (mm)")} />
    {hasEncoders(props.firmwareHardware) &&
      getConfigValue(BooleanSetting.scaled_encoders) &&
      <AxisDisplayGroup
        position={locationData.scaled_encoders}
        label={t("Encoder (mm)")} />}
    {hasEncoders(props.firmwareHardware) &&
      getConfigValue(BooleanSetting.raw_encoders) &&
      <AxisDisplayGroup
        position={locationData.raw_encoders}
        label={t("Encoder (raw)")} />}
    <AxisInputBoxGroup
      position={locationData.position}
      onCommit={moveAbsolute}
      locked={locked}
      dispatch={props.dispatch}
      disabled={arduinoBusy} />
  </div>;
};

export const AxisActions = (props: AxisActionsProps) => {
  const {
    axis, arduinoBusy, locked, hardwareDisabled, botOnline,
    dispatch, botPosition, sourceFwConfig,
  } = props;
  const className = lockedClass(locked);
  const navigate = useNavigate();
  return <Popover position={Position.BOTTOM_RIGHT} usePortal={false}
    target={<i className="fa fa-ellipsis-v" />}
    content={<div className={"axis-actions"}>
      <LockableButton
        disabled={arduinoBusy || !botOnline}
        className={className}
        title={t("MOVE TO HOME")}
        onClick={moveToHomeCommand(axis, botPosition, dispatch)}>
        {t("MOVE TO HOME")}
      </LockableButton>
      <LockableButton
        disabled={arduinoBusy || hardwareDisabled || !botOnline}
        className={className}
        title={t("FIND HOME")}
        onClick={() => {
          findHome(axis);
          dispatch(setMovementStateFromPosition());
        }}>
        {t("FIND HOME")}
      </LockableButton>
      <LockableButton
        disabled={arduinoBusy || !botOnline}
        title={t("SET HOME")}
        onClick={() => setHome(axis)}>
        {t("SET HOME")}
      </LockableButton>
      <LockableButton
        disabled={arduinoBusy || hardwareDisabled || !botOnline}
        className={className}
        title={t("FIND LENGTH")}
        onClick={() => findAxisLength(axis)}>
        {t("FIND LENGTH")}
      </LockableButton>
      <LockableButton
        disabled={!botOnline}
        className={className}
        title={t("SET LENGTH")}
        onClick={setAxisLength({ axis, dispatch, botPosition, sourceFwConfig })}>
        {t("SET LENGTH")}
      </LockableButton>
      <a onClick={() => {
        dispatch(setPanelOpen(true));
        navigate(Path.settings("axes"));
      }}>
        <i className="fa fa-external-link" />
        {t("Settings")}
      </a>
    </div>} />;
};

export const setAxisLength = (props: SetAxisLengthProps) => () => {
  const { axis, dispatch, botPosition, sourceFwConfig } = props;
  const axisPosition = botPosition[axis];
  const axisSettingKeys: Record<Xyz, NumberConfigKey> = {
    x: "movement_axis_nr_steps_x",
    y: "movement_axis_nr_steps_y",
    z: "movement_axis_nr_steps_z",
  };
  const key = axisSettingKeys[axis];
  const value = isUndefined(axisPosition)
    ? undefined
    : "" + Math.abs(axisPosition) * calculateScale(sourceFwConfig)[axis];
  !isUndefined(value) && dispatch(updateMCU(key, value));
};

const moveToHomeCommand = (
  axis: Xyz,
  botPosition: BotPosition,
  dispatch: Function,
) => () => {
  moveToHome(axis);
  dispatch(setMovementState({
    start: botPosition,
    distance: { x: 0, y: 0, z: 0, [axis]: -(botPosition[axis] || 0) },
  }));
};
