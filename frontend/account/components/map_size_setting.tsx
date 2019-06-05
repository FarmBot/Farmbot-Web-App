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
  ({ dispatch, getConfigValue }: MapSizeSettingProps) => {
    const mapSizeX = parseInt("" + getConfigValue(NumericSetting.map_size_x));
    const mapSizeY = parseInt("" + getConfigValue(NumericSetting.map_size_y));
    return <div className={"map-size-inputs"}>
      <Row>
        <Col xs={4}>
          <label>{t("garden map size")}</label>
        </Col>
        <Col xs={4}>
          <p>{t(Content.MAP_SIZE)}</p>
        </Col>
        <Col xs={4}>
          <LengthInput
            value={mapSizeX}
            label={t("x (mm)")}
            setting={NumericSetting.map_size_x}
            dispatch={dispatch} />
          <LengthInput
            value={mapSizeY}
            label={t("y (mm)")}
            setting={NumericSetting.map_size_y}
            dispatch={dispatch} />
        </Col>
      </Row>
    </div>;
  };
