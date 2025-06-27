import React from "react";
import { ThreeDSettingsProps } from "./interfaces";
import { Highlight } from "./maybe_highlight";
import { Actions, DeviceSetting, ToolTips } from "../constants";
import { Header } from "./hardware_settings/header";
import { Collapse } from "@blueprintjs/core";
import {
  BlurableInput, DropDownItem, FBSelect, Help, Row, ToggleButton,
} from "../ui";
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
  legsFlush: 1,
  extraLegsX: 1,
  extraLegsY: 0,
  bedBrightness: 8,
  clouds: 1,
  laser: 0,
  stats: 0,
  threeAxes: 0,
  solar: 0,
  lowDetail: 0,
  eventDebug: 0,
  cableDebug: 0,
  lightsDebug: 0,
  ambient: 75,
  heading: 0,
  sunAzimuth: 230,
  sunInclination: 140,
  bounds: 0,
  grid: 1,
  scene: 0,
};

export const SCENES: Record<number, string> = {
  0: "Outdoor",
  1: "Lab",
  2: "Greenhouse",
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

interface ThreeDConfigProps {
  dispatch: Function;
  distanceIndicator?: string;
  setting: DeviceSetting;
  configKey: string;
  tooltip: string;
  getValue(key: string): number;
  findOrCreate(key: string, value: string): void;
  isToggle?: boolean;
  isScene?: boolean;
}

export const ThreeDConfig = (props: ThreeDConfigProps) => {
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
      {props.isToggle &&
        <ToggleButton
          className={modifiedClassName}
          toggleValue={value}
          toggleAction={() => action(value ? "0" : "1")} />}
      {props.isScene &&
        <FBSelect
          list={Object.values(SCENE_DDIS)}
          selectedItem={SCENE_DDIS[value]}
          onChange={ddi => action("" + ddi.value)} />}
      {!props.isToggle && !props.isScene &&
        <BlurableInput
          type="number"
          wrapperClassName={modifiedClassName}
          value={value}
          onCommit={e => action(e.currentTarget.value)} />}
    </Row>
  </Highlight>;
};

const SCENE_DDIS: Record<number, DropDownItem> = Object.entries(SCENES)
  .reduce((acc, [key, label]) => {
    acc[Number(key)] = { label, value: Number(key) };
    return acc;
  }, {} as Record<number, DropDownItem>);

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
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_BED_WALL_THICKNESS}
        setting={DeviceSetting.bedWallThickness}
        configKey={"bedWallThickness"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_BED_HEIGHT}
        setting={DeviceSetting.bedHeight}
        configKey={"bedHeight"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_CC_SUPPORT_SIZE}
        setting={DeviceSetting.ccSupportSize}
        configKey={"ccSupportSize"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_BEAM_LENGTH}
        setting={DeviceSetting.beamLength}
        configKey={"beamLength"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_COLUMN_LENGTH}
        setting={DeviceSetting.columnLength}
        configKey={"columnLength"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_Z_AXIS_LENGTH}
        setting={DeviceSetting.zAxisLength}
        configKey={"zAxisLength"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_BED_X_OFFSET}
        setting={DeviceSetting.bedXOffset}
        configKey={"bedXOffset"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_BED_Y_OFFSET}
        setting={DeviceSetting.bedYOffset}
        configKey={"bedYOffset"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_BED_Z_OFFSET}
        setting={DeviceSetting.bedZOffset}
        configKey={"bedZOffset"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_LEG_SIZE}
        setting={DeviceSetting.legSize}
        configKey={"legSize"} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_BOUNDS}
        setting={DeviceSetting.bounds}
        configKey={"bounds"}
        isToggle={true} />
      <ThreeDConfig {...common}
        tooltip={ToolTips.THREE_D_GRID}
        setting={DeviceSetting.grid}
        configKey={"grid"}
        isToggle={true} />
    </Collapse>
  </Highlight>;
};
