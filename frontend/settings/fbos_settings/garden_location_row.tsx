import React from "react";
import { t } from "../../i18next_wrapper";
import { DeviceSetting, ToolTips } from "../../constants";
import { Row, ToggleButton } from "../../ui";
import { Highlight } from "../maybe_highlight";
import { GardenLocationRowProps } from "./interfaces";
import { edit, save } from "../../api/crud";
import { getModifiedClassNameSpecifyDefault } from "../default_values";
import { round } from "lodash";
import { ExternalUrl } from "../../external_urls";
import {
  findOrCreate3DConfigFunction, get3DConfigValueFunction, ThreeDConfig,
} from "../three_d_settings";

export const GardenLocationRow = (props: GardenLocationRowProps) => {
  const { dispatch, device } = props;
  const latitude = parseFloat("" + device.body.lat);
  const longitude = parseFloat("" + device.body.lng);
  const { indoor } = device.body;
  return <div className={"garden-location grid"}>
    <Highlight settingName={DeviceSetting.farmbotLocation}>
      <Row className="grid-2-col">
        <div className="row grid-exp-1">
          <label>
            {t(DeviceSetting.farmbotLocation)}
          </label>
          <a href={`${ExternalUrl.openStreetMap(latitude, longitude)}`}
            title={t("view in map (opens in new tab)")}
            target={"_blank"} rel={"noreferrer"}>
            <i className={"fa fa-map fb-icon-button invert"} />
          </a>
          {navigator.geolocation &&
            <button
              className={"blue fb-button"}
              title={t("use current location")}
              onClick={() => {
                navigator.geolocation.getCurrentPosition(position => {
                  dispatch(edit(device, {
                    lat: round(position.coords.latitude, 2),
                    lng: round(position.coords.longitude, 2),
                  }));
                  dispatch(save(device.uuid));
                });
              }}>
              <i className="fa fa-crosshairs" />
            </button>}
        </div>
        <div className="row grid-2-col">
          <div className={"latitude"}>
            <input name={"latitude"}
              type={"number"}
              title={t("latitude")}
              placeholder={t("latitude")}
              className={getModifiedClassNameSpecifyDefault(latitude || 0, 0)}
              onChange={e => dispatch(edit(device, {
                lat: parseFloat(e.currentTarget.value),
              }))}
              onBlur={() => dispatch(save(device.uuid))}
              value={isFinite(latitude) ? latitude : ""} />
          </div>
          <div className={"longitude"}>
            <input name={"longitude"}
              type={"number"}
              title={t("longitude")}
              placeholder={t("longitude")}
              className={getModifiedClassNameSpecifyDefault(longitude || 0, 0)}
              onChange={e => dispatch(edit(device, {
                lng: parseFloat(e.currentTarget.value),
              }))}
              onBlur={() => dispatch(save(device.uuid))}
              value={isFinite(longitude) ? longitude : ""} />
          </div>
        </div>
      </Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.indoor}>
      <Row className="grid-exp-1">
        <label>
          {t(DeviceSetting.indoor)}
        </label>
        <ToggleButton
          toggleValue={!!indoor}
          className={getModifiedClassNameSpecifyDefault(!!indoor, false)}
          toggleAction={() => {
            dispatch(edit(device, { indoor: !indoor }));
            dispatch(save(device.uuid));
          }} />
      </Row>
    </Highlight>
    <ThreeDConfig
      dispatch={dispatch}
      getValue={get3DConfigValueFunction(props.farmwareEnvs)}
      findOrCreate={findOrCreate3DConfigFunction(dispatch, props.farmwareEnvs)}
      tooltip={ToolTips.THREE_D_HEADING}
      setting={DeviceSetting.heading}
      configKey={"heading"} />
    <ThreeDConfig
      dispatch={dispatch}
      getValue={get3DConfigValueFunction(props.farmwareEnvs)}
      findOrCreate={findOrCreate3DConfigFunction(dispatch, props.farmwareEnvs)}
      tooltip={ToolTips.THREE_D_ENVIRONMENT}
      setting={DeviceSetting.environment}
      isScene={true}
      configKey={"scene"} />
  </div>;
};
