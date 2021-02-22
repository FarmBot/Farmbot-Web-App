import React from "react";
import moment from "moment";
import { t } from "../../i18next_wrapper";
import { FBSelect, Row, Col } from "../../ui";
import { edit, save } from "../../api/crud";
import { ColWidth } from "./farmbot_os_settings";
import { DeviceSetting } from "../../constants";
import { Highlight } from "../maybe_highlight";
import { OtaTimeSelectorProps, OtaTimeSelectorRowProps } from "./interfaces";
import { isNumber, range } from "lodash";
import { getModifiedClassNameSpecifyDefault } from "../default_values";

const hourToUtcHour =
  (hour: number | undefined, offset: number): number | undefined =>
    !isNumber(hour) ? undefined : (hour + offset) % 24;

export const ASAP = () => t("As soon as possible");

const formatHour = (hour: number | undefined, hour24: boolean) =>
  !isNumber(hour)
    ? ASAP()
    : moment().startOf("day")
      .add(hour, "hours")
      .format(hour24 ? "H:mm" : "h:mm A");

export const OtaTimeSelector = (props: OtaTimeSelectorProps) => {
  const { device, dispatch, timeSettings } = props;
  const { utcOffset, hour24 } = timeSettings;
  const localHour = hourToUtcHour(device.body.ota_hour_utc, -utcOffset) ??
    device.body.ota_hour;
  return <FBSelect key={formatHour(localHour, hour24)}
    selectedItem={!isNumber(localHour)
      ? undefined
      : { label: formatHour(localHour, hour24), value: localHour }}
    onChange={ddi => {
      const newLocalHour = ddi ? parseInt("" + ddi.value) : undefined;
      dispatch(edit(device, {
        ota_hour: newLocalHour,
        ota_hour_utc: hourToUtcHour(newLocalHour, utcOffset),
      }));
      dispatch(save(device.uuid));
    }}
    list={range(24)
      .map(hour => ({ label: formatHour(hour, hour24), value: hour }))}
    allowEmpty={true}
    customNullLabel={ASAP()}
    extraClass={[
      props.disabled ? "disabled" : "",
      getModifiedClassNameSpecifyDefault(localHour, 3),
    ].join(" ")} />;
};

export function OtaTimeSelectorRow(props: OtaTimeSelectorRowProps) {
  const osAutoUpdate = props.sourceFbosConfig("os_auto_update");
  return <Highlight settingName={DeviceSetting.osUpdateTime}>
    <Row>
      <Col xs={5}>
        <label>
          {t(DeviceSetting.osUpdateTime)}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <OtaTimeSelector
          timeSettings={props.timeSettings}
          disabled={!osAutoUpdate.value}
          dispatch={props.dispatch}
          device={props.device} />
      </Col>
    </Row>
  </Highlight>;
}
