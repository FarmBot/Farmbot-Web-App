import React from "react";
import { ThreeDSettingsProps } from "./interfaces";
import { Highlight } from "./maybe_highlight";
import { Actions, Content, DeviceSetting, ToolTips } from "../constants";
import { Header } from "./hardware_settings/header";
import { Collapse } from "@blueprintjs/core";
import {
  BlurableInput, DropDownItem, FBSelect, Help, Row, ToggleButton,
} from "../ui";
import { t } from "../i18next_wrapper";
import { TaggedFarmwareEnv } from "farmbot";
import { isUndefined } from "lodash";
import { destroy, edit, initSave, save } from "../api/crud";
import { getModifiedClassNameSpecifyDefault } from "./default_values";
import { Config, SurfaceDebugOption } from "../three_d_garden/config";
import { DevSettings } from "./dev/dev_support";

const DEFAULTS: Partial<Record<keyof Config, number>> = {
  bedWallThickness: 40,
  bedHeight: 300,
  ccSupportSize: 50,
  beamLength: 1500,
  columnLength: 500,
  zAxisLength: 1000,
  bedXOffset: 150,
  bedYOffset: 20,
  bedZOffset: 0,
  legSize: 100,
  legsFlush: 1,
  extraLegsX: 1,
  extraLegsY: 0,
  bedBrightness: 8,
  soilBrightness: 12,
  clouds: 1,
  constellations: 1,
  constellationsDebug: 0,
  laser: 0,
  stats: 0,
  threeAxes: 0,
  solar: 0,
  lowDetail: 0,
  eventDebug: 0,
  cableDebug: 0,
  lightsDebug: 0,
  moistureDebug: 0,
  cameraFitDebug: 0,
  viewCube: 1,
  ground: 1,
  groundTexture: 0,
  surfaceDebug: SurfaceDebugOption.none,
  ambient: 75,
  sun: 75,
  heading: 0,
  sunAzimuth: 230,
  sunInclination: 140,
  bounds: 0,
  grid: 1,
  scene: 0,
  tracks: 1,
  cableCarriers: 1,
  axes: 0,
  xyDimensions: 0,
  zDimension: 0,
  people: 0,
};

export const SCENES: Record<number, string> = {
  0: "Custom",
  1: "Outdoor",
  2: "Lab",
  3: "Greenhouse",
  4: "Mars",
};

export const SCENE_LABELS = (): Record<string, string> => ({
  Outdoor: t("Outdoor"),
  Lab: t("Lab"),
  Greenhouse: t("Greenhouse"),
  Custom: t("Custom"),
  Mars: t("Mars"),
});

export const TEXTURES: Record<number, string> = {
  0: "grass",
  1: "bricks",
  2: "concrete",
  3: "water",
  4: "aluminum",
  5: "soil",
  6: "sand",
  7: "wood",
};

export const TEXTURE_LABELS = (): Record<string, string> => ({
  grass: t("Grass"),
  bricks: t("Bricks"),
  concrete: t("Concrete"),
  water: t("Water"),
  aluminum: t("Aluminum"),
  soil: t("Soil"),
  sand: t("Sand"),
  wood: t("Wood"),
});

const GROUND_TEXTURE_FOR_SCENE: Record<string, string> = {
  Outdoor: "grass",
  Lab: "concrete",
  Greenhouse: "bricks",
  Custom: "grass",
  Mars: "sand",
};

const GROUND_TEXTURE_NUM_FROM_SCENE_NUM: Record<number, number> =
  Object.entries(GROUND_TEXTURE_FOR_SCENE)
    .reduce((acc, [sceneName, textureName]) => {
      const sceneNum = Number(Object.entries(SCENES)
        .find(([_, name]) => name == sceneName)?.[0]);
      const textureNum = Number(Object.entries(TEXTURES)
        .find(([_, name]) => name == textureName)?.[0]);
      acc[sceneNum] = textureNum;
      return acc;
    }, {} as Record<number, number>);

export const namespace3D = (key: string): string => "3D_" + key;

const find =
  (envs: TaggedFarmwareEnv[], key: string): TaggedFarmwareEnv | undefined =>
    envs.find(env => env.body.key == namespace3D(key));

const index3DConfigs = (envs: TaggedFarmwareEnv[]) => {
  const configs: Record<string, TaggedFarmwareEnv> = {};
  envs.forEach(env => {
    if (env.body.key.startsWith(namespace3D(""))
      && isUndefined(configs[env.body.key])) {
      configs[env.body.key] = env;
    }
  });
  return configs;
};

export const get3DConfigValueFunction = (envs: TaggedFarmwareEnv[]) => {
  const configs = index3DConfigs(envs);
  return (key: keyof Config): number => {
    const maybe = configs[namespace3D(key)];
    const raw = isUndefined(maybe) ? DEFAULTS[key] : maybe.body.value;
    if (raw === true || raw === "true") { return 1; }
    if (raw === false || raw === "false") { return 0; }
    return parseFloat("" + raw);
  };
};

export const findOrCreate3DConfigFunction =
  (dispatch: Function, envs: TaggedFarmwareEnv[]) =>
    (key: keyof Config, value: string) => {
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
  configKey: keyof Config;
  tooltip: string;
  getValue(key: string): number;
  findOrCreate(key: string, value: string): void;
  isToggle?: boolean;
  isScene?: boolean;
  isTexture?: boolean;
  sceneObjectUuids: string[];
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
            defaultConfigValue: "" + DEFAULTS[configKey],
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
          key={value + props.sceneObjectUuids.join(",")}
          list={SCENE_DDI_LIST()}
          selectedItem={SCENE_DDIS()[value]}
          onChange={ddi => {
            if (ddi.value == value) { return; }
            if (SCENES[ddi.value as number] != "Custom") {
              if (props.sceneObjectUuids.length > 0) {
                if (!confirm(t(Content.CONFIRM_SCENE_CHANGE,
                  { count: props.sceneObjectUuids.length }))) {
                  return;
                }
              }
              props.sceneObjectUuids.map(uuid => dispatch(destroy(uuid)));
            }
            action("" + ddi.value);
            props.findOrCreate("groundTexture",
              "" + GROUND_TEXTURE_NUM_FROM_SCENE_NUM[ddi.value as number]);
          }} />}
      {props.isTexture &&
        <FBSelect
          key={value}
          list={Object.values(TEXTURE_DDIS())}
          selectedItem={TEXTURE_DDIS()[value]}
          onChange={ddi => action("" + ddi.value)} />}
      {!props.isToggle && !props.isScene && !props.isTexture &&
        <BlurableInput
          type="number"
          wrapperClassName={modifiedClassName}
          value={value}
          onCommit={e => action(e.currentTarget.value)} />}
    </Row>
  </Highlight>;
};

const DDIS = (
  values: Record<number, string>,
  labels: Record<string, string>,
): Record<number, DropDownItem> =>
  Object.entries(values)
    .reduce((acc, [key, value]) => {
      acc[Number(key)] = {
        label: labels[value] || value,
        value: Number(key),
      };
      return acc;
    }, {} as Record<number, DropDownItem>);

export const SCENE_DDIS = () => DDIS(SCENES, SCENE_LABELS());
export const SCENE_DDI_LIST = () => Object.values(SCENE_DDIS())
  .filter(ddi => ![
    DevSettings.futureFeaturesEnabled()
      ? undefined
      : SCENE_NUM_FROM_NAME["Mars"],
  ].filter((v): v is number => !!v).includes(ddi.value as number));
export const TEXTURE_DDIS = () => DDIS(TEXTURES, TEXTURE_LABELS());

const BY_NAME = (values: Record<number, string>) =>
  Object.entries(values)
    .reduce((acc, [key, label]) => {
      acc[label] = Number(key);
      return acc;
    }, {} as Record<string, number>);
export const SCENE_NUM_FROM_NAME = BY_NAME(SCENES);

export const ThreeDSettings = (props: ThreeDSettingsProps) => {
  const { dispatch, distanceIndicator } = props;
  const getValue = get3DConfigValueFunction(props.farmwareEnvs);
  const findOrCreate = findOrCreate3DConfigFunction(dispatch, props.farmwareEnvs);
  const common = {
    dispatch, getValue, findOrCreate, distanceIndicator,
    sceneObjectUuids: props.sceneObjectUuids,
  };
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
