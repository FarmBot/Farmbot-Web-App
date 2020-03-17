import * as React from "react";
import {
  BlurableInput,
  Row, Col,
  FBSelect, NULL_CHOICE, DropDownItem,
} from "../../ui/index";
import { SettingsMenuProps } from "./interfaces";
import {
  SPECIAL_VALUE_DDI, CALIBRATION_DROPDOWNS, ORIGIN_DROPDOWNS,
} from "./constants";
import { WD_ENV } from "./remote_env/interfaces";
import { envGet } from "./remote_env/selectors";
import { SPECIAL_VALUES } from "./remote_env/constants";
import { isNumber } from "lodash";
import { t } from "../../i18next_wrapper";

export class WeedDetectorConfig extends React.Component<SettingsMenuProps, {}> {
  getValue(conf: keyof WD_ENV) { return envGet(conf, this.props.values); }
  get simple() { return !!this.getValue("CAMERA_CALIBRATION_easy_calibration"); }

  NumberBox = ({ conf, label }: {
    conf: keyof WD_ENV;
    label: string;
  }) => {
    return <div className={"camera-config-number-box"}>
      <label htmlFor={conf}>
        {label}
      </label>
      <BlurableInput type="number"
        id={conf}
        value={"" + this.getValue(conf)}
        onCommit={e =>
          this.props.onChange(conf, parseFloat(e.currentTarget.value))}
        placeholder={label} />
    </div>;
  };

  setDDI = (k: keyof WD_ENV) => (d: DropDownItem) => {
    if (isNumber(d.value)) {
      this.props.onChange(k, d.value);
    } else {
      throw new Error("Weed detector got a non-numeric value");
    }
  };

  find = (conf: keyof WD_ENV): DropDownItem =>
    SPECIAL_VALUE_DDI[this.getValue(conf)] || NULL_CHOICE

  render() {
    return <div className={"camera-calibration-config"}>
      {!this.simple &&
        <div className={"camera-calibration-configs"}>
          <BoolConfig
            wDEnv={this.props.values}
            configKey={"CAMERA_CALIBRATION_invert_hue_selection"}
            label={t("Invert Hue Range Selection")}
            onChange={this.props.onChange} />
          <this.NumberBox
            conf={"CAMERA_CALIBRATION_calibration_object_separation"}
            label={t(`Calibration Object Separation`)} />
          <label>
            {t(`Calibration Object Separation along axis`)}
          </label>
          <FBSelect
            onChange={this.setDDI("CAMERA_CALIBRATION_calibration_along_axis")}
            selectedItem={this.find("CAMERA_CALIBRATION_calibration_along_axis")}
            list={CALIBRATION_DROPDOWNS} />
          <Row>
            <Col xs={6}>
              <this.NumberBox
                conf={"CAMERA_CALIBRATION_camera_offset_x"}
                label={t(`Camera Offset X`)} />
            </Col>
            <Col xs={6}>
              <this.NumberBox
                conf={"CAMERA_CALIBRATION_camera_offset_y"}
                label={t(`Camera Offset Y`)} />
            </Col>
          </Row>
          <label htmlFor="image_bot_origin_location">
            {t(`Origin Location in Image`)}
          </label>
          <FBSelect
            list={ORIGIN_DROPDOWNS}
            onChange={this.setDDI("CAMERA_CALIBRATION_image_bot_origin_location")}
            selectedItem={this.find("CAMERA_CALIBRATION_image_bot_origin_location")} />
        </div>}
      <Row>
        <Col xs={6}>
          <this.NumberBox
            conf={"CAMERA_CALIBRATION_coord_scale"}
            label={t(`Pixel coordinate scale`)} />
        </Col>
        <Col xs={6}>
          <this.NumberBox
            conf={"CAMERA_CALIBRATION_total_rotation_angle"}
            label={t(`Camera rotation`)} />
        </Col>
      </Row>
    </div>;
  }
}

export interface BoolConfigProps {
  configKey: keyof WD_ENV;
  label: string;
  wDEnv: Partial<WD_ENV>;
  onChange(key: keyof WD_ENV, value: number): void;
}

export const BoolConfig = (props: BoolConfigProps) =>
  <div className="boolean-camera-calibration-config">
    <label htmlFor={props.configKey}>
      {t(props.label)}
    </label>
    <input
      type="checkbox"
      name={props.configKey}
      id={props.configKey}
      checked={!!envGet(props.configKey, props.wDEnv)}
      onChange={e =>
        props.onChange(props.configKey,
          e.currentTarget.checked ?
            SPECIAL_VALUES.TRUE : SPECIAL_VALUES.FALSE)} />
  </div>;
