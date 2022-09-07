import React from "react";
import {
  BlurableInput, FBSelect, NULL_CHOICE, DropDownItem, Help,
} from "../../ui";
import { CameraCalibrationConfigProps } from "./interfaces";
import {
  SPECIAL_VALUE_DDI, CALIBRATION_DROPDOWNS, ORIGIN_DROPDOWNS,
} from "./constants";
import { WD_ENV } from "../remote_env/interfaces";
import { envGet } from "../remote_env/selectors";
import {
  SPECIAL_VALUES, CAMERA_CALIBRATION_KEY_PART, WD_KEY_DEFAULTS, namespace,
} from "../remote_env/constants";
import { isNumber, isUndefined } from "lodash";
import { t } from "../../i18next_wrapper";
import { DeviceSetting, ToolTips } from "../../constants";
import { getModifiedClassName } from "../default_values";
import { Highlight } from "../../settings/maybe_highlight";
import { Path } from "../../internal_urls";

export class CameraCalibrationConfig
  extends React.Component<CameraCalibrationConfigProps, {}> {

  wdEnvGet = (key: keyof WD_ENV) => envGet(key, this.props.values);

  namespace = namespace("CAMERA_CALIBRATION_");

  getDefault = (key: CAMERA_CALIBRATION_KEY_PART) =>
    WD_KEY_DEFAULTS[this.namespace(key)];

  getLabeledDefault = (key: CAMERA_CALIBRATION_KEY_PART) =>
    SPECIAL_VALUE_DDI()[this.getDefault(key)].label;

  render() {
    const simple = !!this.wdEnvGet(this.namespace("easy_calibration"));
    const commonProps = {
      wdEnvGet: this.wdEnvGet,
      onChange: this.props.onChange,
    };
    const { calibrationZ } = this.props;
    return <div className={"camera-calibration-config"}>
      {!simple &&
        <div className={"camera-calibration-configs"}>
          <BoolConfig {...commonProps}
            settingName={DeviceSetting.invertHueRangeSelection}
            helpText={t(ToolTips.INVERT_HUE_SELECTION, {
              defaultInvertState: this.getLabeledDefault("invert_hue_selection")
            })}
            configKey={this.namespace("invert_hue_selection")} />
          <NumberBoxConfig {...commonProps}
            settingName={DeviceSetting.calibrationObjectSeparation}
            configKey={this.namespace("calibration_object_separation")}
            helpText={t(ToolTips.OBJECT_SEPARATION, {
              defaultSeparation: this.getDefault("calibration_object_separation")
            })} />
          <DropdownConfig {...commonProps}
            settingName={DeviceSetting.calibrationObjectSeparationAlongAxis}
            extraClass={"narrow"}
            list={CALIBRATION_DROPDOWNS}
            configKey={this.namespace("calibration_along_axis")}
            helpText={t(ToolTips.CALIBRATION_OBJECT_AXIS, {
              defaultAxis: this.getLabeledDefault("calibration_along_axis")
            })} />
        </div>}
      <NumberBoxConfig {...commonProps}
        settingName={DeviceSetting.cameraOffsetX}
        configKey={this.namespace("camera_offset_x")}
        helpText={t(ToolTips.CAMERA_OFFSET, {
          defaultX: this.getDefault("camera_offset_x"),
          defaultY: this.getDefault("camera_offset_y"),
        })} />
      <NumberBoxConfig {...commonProps}
        settingName={DeviceSetting.cameraOffsetY}
        configKey={this.namespace("camera_offset_y")}
        helpText={t(ToolTips.CAMERA_OFFSET, {
          defaultX: this.getDefault("camera_offset_x"),
          defaultY: this.getDefault("camera_offset_y"),
        })} />
      <DropdownConfig {...commonProps}
        settingName={DeviceSetting.originLocationInImage}
        list={ORIGIN_DROPDOWNS()}
        configKey={this.namespace("image_bot_origin_location")}
        helpText={t(ToolTips.IMAGE_BOT_ORIGIN_LOCATION, {
          defaultOrigin: this.getLabeledDefault("image_bot_origin_location")
        })} />
      <NumberBoxConfig {...commonProps}
        settingName={DeviceSetting.pixelCoordinateScale}
        configKey={this.namespace("coord_scale")}
        helpText={t(ToolTips.COORDINATE_SCALE, {
          defaultScale: this.getDefault("coord_scale")
        })} />
      <NumberBoxConfig {...commonProps}
        settingName={DeviceSetting.cameraRotation}
        configKey={this.namespace("total_rotation_angle")}
        helpText={t(ToolTips.IMAGE_ROTATION_ANGLE, {
          defaultAngle: this.getDefault("total_rotation_angle")
        })} />
      <p title={JSON.stringify(this.props.calibrationImageCenter)}>
        {!isUndefined(calibrationZ)
          ? `${t("Camera calibrated at z-axis height")}: ${calibrationZ}`
          : t("Camera not yet calibrated.")}
      </p>
    </div>;
  }
}

export interface BoolConfigProps {
  configKey: keyof WD_ENV;
  wdEnvGet(key: keyof WD_ENV): number;
  onChange(key: keyof WD_ENV, value: number): void;
  helpText?: string;
  links?: React.ReactElement[];
  invert?: boolean;
  settingName: DeviceSetting;
  showAdvanced?: boolean;
  modified?: boolean;
  advanced?: boolean;
}

export const BoolConfig = (props: BoolConfigProps) => {
  const value = !!props.wdEnvGet(props.configKey);
  return <Highlight settingName={props.settingName}
    hidden={props.advanced && !(props.showAdvanced || props.modified)}
    className={props.advanced ? "advanced" : undefined}
    pathPrefix={Path.photos}>
    <div className="boolean-camera-calibration-config">
      <label htmlFor={props.configKey}>
        {t(props.settingName)}
      </label>
      {props.helpText && <Help text={props.helpText} links={props.links} />}
      <input
        type="checkbox"
        name={props.configKey}
        id={props.configKey}
        className={getModifiedClassName(props.configKey, value)}
        checked={props.invert ? !value : value}
        onChange={e => {
          const { checked } = e.currentTarget;
          const newValue = props.invert ? !checked : checked;
          props.onChange(props.configKey,
            newValue ? SPECIAL_VALUES.TRUE : SPECIAL_VALUES.FALSE);
        }} />
    </div>
  </Highlight>;
};

export interface NumberBoxConfigProps {
  configKey: keyof WD_ENV;
  wdEnvGet(key: keyof WD_ENV): number;
  onChange(key: keyof WD_ENV, value: number): void;
  helpText: string;
  scale?: number;
  settingName: DeviceSetting;
}

export const NumberBoxConfig = (props: NumberBoxConfigProps) => {
  return <Highlight settingName={props.settingName} pathPrefix={Path.photos}>
    <div className={"camera-config-number-box"}>
      <label htmlFor={props.configKey}>
        {t(props.settingName)}
      </label>
      <Help text={props.helpText} />
      <BlurableInput type="number"
        id={props.configKey}
        className={getModifiedClassName(props.configKey,
          props.wdEnvGet(props.configKey))}
        value={"" + (props.wdEnvGet(props.configKey) * (props.scale || 1))}
        onCommit={e =>
          props.onChange(props.configKey,
            parseFloat(e.currentTarget.value) / (props.scale || 1))}
        placeholder={t(props.settingName)} />
    </div>
  </Highlight>;
};

export interface DropdownConfigProps {
  configKey: keyof WD_ENV;
  wdEnvGet(key: keyof WD_ENV): number;
  onChange(key: keyof WD_ENV, value: number): void;
  helpText: string;
  list: DropDownItem[];
  extraClass?: string;
  settingName: DeviceSetting;
}

export const DropdownConfig = (props: DropdownConfigProps) =>
  <Highlight settingName={props.settingName} pathPrefix={Path.photos}>
    <div className={`dropdown-camera-calibration-config ${props.extraClass}`}>
      <label htmlFor={props.configKey}>
        {t(props.settingName)}
      </label>
      <Help text={props.helpText} />
      <FBSelect
        extraClass={getModifiedClassName(props.configKey,
          props.wdEnvGet(props.configKey))}
        list={props.list}
        onChange={ddi => {
          if (isNumber(ddi.value)) {
            props.onChange(props.configKey, ddi.value);
          } else {
            throw new Error("Weed detector got a non-numeric value");
          }
        }}
        selectedItem={SPECIAL_VALUE_DDI()[props.wdEnvGet(props.configKey)]
          || NULL_CHOICE} />
    </div>
  </Highlight>;
