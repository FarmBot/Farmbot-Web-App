import React from "react";
import { t } from "../../i18next_wrapper";
import { DeviceSetting } from "../../constants";
import { Col, Row, ToggleButton } from "../../ui";
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
  return <div className={"garden-location"}>
    <Highlight settingName={DeviceSetting.farmbotLocation}>
      <Row>
        <Col xs={5}>
          <label>
            {t(DeviceSetting.farmbotLocation)}
          </label>
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
          <a href={`${ExternalUrl.openStreetMap(latitude, longitude)}`}
            title={t("view in map (opens in new tab)")}
            target={"_blank"} rel={"noreferrer"}>
            <i className={"fa fa-map fb-icon-button"} />
          </a>
        </Col>
        <Col xs={3} className={"latitude"}>
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
        </Col>
        <Col xs={3} xsOffset={1} className={"longitude"}>
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
        </Col>
      </Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.indoor}>
      <Row>
        <Col xs={7}>
          <label>
            {t(DeviceSetting.indoor)}
          </label>
        </Col>
        <Col xs={5}>
          <ToggleButton
            toggleValue={!!indoor}
            className={getModifiedClassNameSpecifyDefault(!!indoor, false)}
            toggleAction={() => {
              dispatch(edit(device, { indoor: !indoor }));
              dispatch(save(device.uuid));
            }} />
        </Col>
      </Row>
    </Highlight>
  </div>;
};
