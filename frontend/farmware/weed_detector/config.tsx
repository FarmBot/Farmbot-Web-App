import * as React from "react";
import {
  BlurableInput,
  Row, Col,
  FBSelect, NULL_CHOICE, DropDownItem
} from "../../ui/index";
import { SettingsMenuProps } from "./interfaces";
import {
  SPECIAL_VALUE_DDI, CALIBRATION_DROPDOWNS, ORIGIN_DROPDOWNS
} from "./constants";
import { WD_ENV } from "./remote_env/interfaces";
import { envGet } from "./remote_env/selectors";
import { SPECIAL_VALUES } from "./remote_env/constants";
import { isNumber } from "lodash";
import { t } from "../../i18next_wrapper";

export class WeedDetectorConfig extends React.Component<SettingsMenuProps, {}> {
  NumberBox = ({ conf, label }: {
    conf: keyof WD_ENV;
    label: string;
  }) => {
    return <div>
      <label htmlFor={conf}>
        {label}
      </label>
      <BlurableInput type="number"
        id={conf}
        value={"" + envGet(conf, this.props.values)}
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

  find = (needle: keyof WD_ENV): DropDownItem => {
    const wow = envGet(needle, this.props.values);
    const ok = SPECIAL_VALUE_DDI[wow];
    return ok || NULL_CHOICE;
  };

  render() {
    return <div>
      <label htmlFor="invert_hue_selection">
        {t("Invert Hue Range Selection")}
      </label>
      <div>
        <input
          type="checkbox"
          id="invert_hue_selection"
          checked={!!envGet("CAMERA_CALIBRATION_invert_hue_selection",
            this.props.values)}
          onChange={e =>
            this.props.onChange("CAMERA_CALIBRATION_invert_hue_selection",
              e.currentTarget.checked ?
                SPECIAL_VALUES.TRUE : SPECIAL_VALUES.FALSE)} />
      </div>
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
