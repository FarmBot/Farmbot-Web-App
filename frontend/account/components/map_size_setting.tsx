import * as React from "react";
import {
  GetWebAppConfigValue, setWebAppConfigValue
} from "../../config_storage/actions";
import { t } from "../../i18next_wrapper";
import { Row, Col } from "../../ui";
import { NumericSetting } from "../../session_keys";
import { Content } from "../../constants";
import {
  NumberConfigKey as WebAppNumberConfigKey
} from "farmbot/dist/resources/configs/web_app";

export interface MapSizeSettingProps {
  getConfigValue: GetWebAppConfigValue;
  dispatch: Function;
}

interface LengthInputProps {
  value: number;
  label: string;
  setting: WebAppNumberConfigKey;
  dispatch: Function;
}

const LengthInput = (props: LengthInputProps) =>
  <Row>
    <Col xs={5}>
      <label style={{ float: "right" }}>{t(props.label)}</label>
    </Col>
    <Col xs={7}>
      <input
        type="number"
        value={"" + props.value}
        onChange={e => props.dispatch(setWebAppConfigValue(
          props.setting, e.currentTarget.value))} />
    </Col>
  </Row>;

export const MapSizeSetting =
  ({ dispatch, getConfigValue }: MapSizeSettingProps) =>
    <div className={"map-size-setting"}>
      <Row>
        <Col xs={4}>
          <label>{t("garden map size")}</label>
        </Col>
        <Col xs={4}>
          <p>{t(Content.MAP_SIZE)}</p>
        </Col>
        <Col xs={4}>
          <MapSizeInputs
            getConfigValue={getConfigValue}
            dispatch={dispatch} />
        </Col>
      </Row>
    </div>;

interface MapSizeInputsProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

export const MapSizeInputs = (props: MapSizeInputsProps) =>
  <div className="map-size-inputs">
    <LengthInput
      value={parseInt("" + props.getConfigValue(NumericSetting.map_size_x))}
      label={t("x (mm)")}
      setting={NumericSetting.map_size_x}
      dispatch={props.dispatch} />
    <LengthInput
      value={parseInt("" + props.getConfigValue(NumericSetting.map_size_y))}
      label={t("y (mm)")}
      setting={NumericSetting.map_size_y}
      dispatch={props.dispatch} />
  </div>;
