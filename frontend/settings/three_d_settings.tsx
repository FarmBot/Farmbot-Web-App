import React from "react";
import { ThreeDSettingsProps } from "./interfaces";
import { Highlight } from "./maybe_highlight";
import { Actions, DeviceSetting, ToolTips } from "../constants";
import { Header } from "./hardware_settings/header";
import { Collapse } from "@blueprintjs/core";
import { BlurableInput, Help, Row, ToggleButton } from "../ui";
import { t } from "../i18next_wrapper";
import { TaggedFarmwareEnv } from "farmbot";
import { isUndefined } from "lodash";
import { edit, initSave, save } from "../api/crud";
import { getModifiedClassNameSpecifyDefault } from "./default_values";

const DEFAULTS: Record<string, number> = {
  bedWallThickness: 40,
  bedHeight: 300,
  ccSupportSize: 50,
  beamLength: 1500,
  columnLength: 500,
  zAxisLength: 1000,
  bedXOffset: 140,
  bedYOffset: 20,
  bedZOffset: 0,
  legSize: 100,
  bounds: 0,
  grid: 0,
};

export const namespace3D = (key: string): string => "3D_" + key;

const find =
  (envs: TaggedFarmwareEnv[], key: string): TaggedFarmwareEnv | undefined =>
    envs.filter(env => env.body.key == namespace3D(key))[0];

export const get3DConfigValueFunction = (envs: TaggedFarmwareEnv[]) =>
  (key: string): number => {
    const maybe = find(envs, key);
    const raw = isUndefined(maybe) ? DEFAULTS[key] : maybe.body.value;
    return parseFloat("" + raw);
  };

export const findOrCreate3DConfigFunction =
  (dispatch: Function, envs: TaggedFarmwareEnv[]) =>
    (key: string, value: string) => {
      const maybe = find(envs, key);
      if (isUndefined(maybe)) {
        if (value != "" + DEFAULTS[key]) {
          dispatch(initSave("FarmwareEnv", { key: namespace3D(key), value }));
        }
      } else {
        dispatch(edit(maybe, { value }));
        dispatch(save(maybe.uuid));
      }
    };

interface ConfigProps {
  dispatch: Function;
  distanceIndicator: string;
  setting: DeviceSetting;
  configKey: string;
  tooltip: string;
  getValue(key: string): number;
  findOrCreate(key: string, value: string): void;
  isToggle?: boolean;
}

const Config = (props: ConfigProps) => {
  const { dispatch, configKey, distanceIndicator } = props;
  const value = props.getValue(configKey);
  const modifiedClassName = getModifiedClassNameSpecifyDefault(
    value, DEFAULTS[configKey]);
  const action = (newValue: string) => props.findOrCreate(configKey, newValue);
  return <Highlight settingName={props.setting}>
    <Row className="grid-2-col">
      <div className={"labels"}>
        <label>
          {t(props.setting)}
        </label>
        <Help
          text={t(props.tooltip, {
            defaultConfigValue: DEFAULTS[configKey],
          })}
          setOpen={() => dispatch({
            type: Actions.SET_DISTANCE_INDICATOR,
            payload: distanceIndicator ? "" : configKey,
          })} />
      </div>
      {props.isToggle
        ? <ToggleButton
          className={modifiedClassName}
          toggleValue={value}
          toggleAction={() => action(value ? "0" : "1")} />
        :
        <BlurableInput
          type="number"
          wrapperClassName={modifiedClassName}
          value={value}
          onCommit={e => action(e.currentTarget.value)} />}
    </Row>
  </Highlight>;
};

export const ThreeDSettings = (props: ThreeDSettingsProps) => {
  const { dispatch, distanceIndicator } = props;
  const getValue = get3DConfigValueFunction(props.farmwareEnvs);
  const findOrCreate = findOrCreate3DConfigFunction(dispatch, props.farmwareEnvs);
  const common = { dispatch, getValue, findOrCreate, distanceIndicator };
  return <Highlight className={"section"}
    settingName={DeviceSetting.threeDGarden}>
    <Header
      title={DeviceSetting.threeDGarden}
      panel={"three_d"}
      dispatch={props.dispatch}
      expanded={props.settingsPanelState.three_d} />
    <Collapse isOpen={!!props.settingsPanelState.three_d}>
      <Config {...common}
        tooltip={ToolTips.THREE_D_BED_WALL_THICKNESS}
        setting={DeviceSetting.bedWallThickness}
        configKey={"bedWallThickness"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_BED_HEIGHT}
        setting={DeviceSetting.bedHeight}
        configKey={"bedHeight"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_CC_SUPPORT_SIZE}
        setting={DeviceSetting.ccSupportSize}
        configKey={"ccSupportSize"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_BEAM_LENGTH}
        setting={DeviceSetting.beamLength}
        configKey={"beamLength"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_COLUMN_LENGTH}
        setting={DeviceSetting.columnLength}
        configKey={"columnLength"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_Z_AXIS_LENGTH}
        setting={DeviceSetting.zAxisLength}
        configKey={"zAxisLength"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_BED_X_OFFSET}
        setting={DeviceSetting.bedXOffset}
        configKey={"bedXOffset"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_BED_Y_OFFSET}
        setting={DeviceSetting.bedYOffset}
        configKey={"bedYOffset"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_BED_Z_OFFSET}
        setting={DeviceSetting.bedZOffset}
        configKey={"bedZOffset"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_LEG_SIZE}
        setting={DeviceSetting.legSize}
        configKey={"legSize"} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_BOUNDS}
        setting={DeviceSetting.bounds}
        configKey={"bounds"}
        isToggle={true} />
      <Config {...common}
        tooltip={ToolTips.THREE_D_GRID}
        setting={DeviceSetting.grid}
        configKey={"grid"}
        isToggle={true} />
    </Collapse>
  </Highlight>;
};
