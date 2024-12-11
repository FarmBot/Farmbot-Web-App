import React from "react";
import { t } from "../../i18next_wrapper";
import { DeviceSetting } from "../../constants";
import { Row, ToggleButton } from "../../ui";
import { Highlight } from "../maybe_highlight";
import { GardenLocationRowProps } from "./interfaces";
import { edit, save } from "../../api/crud";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { getModifiedClassNameSpecifyDefault } from "../default_values";
import { round } from "lodash";
import { ExternalUrl } from "../../external_urls";

export const GardenLocationRow = (props: GardenLocationRowProps) => {
  const { dispatch, device } = props;
  const latitudeKey: keyof DeviceAccountSettings = "lat";
  const latitude = device.body[latitudeKey];
  const longitudeKey: keyof DeviceAccountSettings = "lng";
  const longitude = device.body[longitudeKey];
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
                    [latitudeKey]: round(position.coords.latitude, 2),
                    [longitudeKey]: round(position.coords.longitude, 2),
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
                [latitudeKey]: parseFloat(e.currentTarget.value),
              }))}
              onBlur={() => dispatch(save(device.uuid))}
              value={latitude || ""} />
          </div>
          <div className={"longitude"}>
            <input name={"longitude"}
              type={"number"}
              title={t("longitude")}
              placeholder={t("longitude")}
              className={getModifiedClassNameSpecifyDefault(longitude || 0, 0)}
              onChange={e => dispatch(edit(device, {
                [longitudeKey]: parseFloat(e.currentTarget.value),
              }))}
              onBlur={() => dispatch(save(device.uuid))}
              value={longitude || ""} />
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
  </div>;
};
