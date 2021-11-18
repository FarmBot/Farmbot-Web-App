import React from "react";
import moment from "moment";
import { t } from "../../i18next_wrapper";
import { FBSelect, Row, Col, DropDownItem, Help } from "../../ui";
import { edit, save } from "../../api/crud";
import { ColWidth } from "./farmbot_os_settings";
import { Content, DeviceSetting } from "../../constants";
import { Highlight } from "../maybe_highlight";
import { OtaTimeSelectorProps, OtaTimeSelectorRowProps } from "./interfaces";
import { isNumber, range } from "lodash";
import { getModifiedClassNameSpecifyDefault } from "../default_values";
import { updateConfig } from "../../devices/actions";

const hourToUtcHour =
  (hour: number | undefined, offset: number): number | undefined =>
    !isNumber(hour) ? undefined : (hour + offset) % 24;

export const ASAP = () => t("As soon as possible");
const DDI_NEVER = () => ({ label: t("Never"), value: "never" });

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
  const osAutoUpdate = props.sourceFbosConfig("os_auto_update");
  const selected = () => {
    if (!osAutoUpdate.value) { return DDI_NEVER(); }
    return !isNumber(localHour)
      ? undefined
      : { label: formatHour(localHour, hour24), value: localHour };
  };
  return <FBSelect key={formatHour(localHour, hour24) + osAutoUpdate.value}
    selectedItem={selected()}
    onChange={ddi => {
      if (ddi?.value == DDI_NEVER().value) {
        props.dispatch(updateConfig({ os_auto_update: false }));
        return;
      }
      !osAutoUpdate.value &&
        props.dispatch(updateConfig({ os_auto_update: true }));
      const newLocalHour = ddi ? parseInt("" + ddi.value) : undefined;
      dispatch(edit(device, {
        ota_hour: newLocalHour,
        ota_hour_utc: hourToUtcHour(newLocalHour, utcOffset),
      }));
      dispatch(save(device.uuid));
    }}
    list={range(24)
      .map((hour: number): DropDownItem =>
        ({ label: formatHour(hour, hour24), value: hour }))
      .concat(DDI_NEVER())}
    allowEmpty={true}
    customNullLabel={ASAP()}
    extraClass={[
      !osAutoUpdate.consistent ? "dim" : "",
      getModifiedClassNameSpecifyDefault(localHour, 3),
      getModifiedClassNameSpecifyDefault(osAutoUpdate.value, true),
    ].join(" ")} />;
};

export function OtaTimeSelectorRow(props: OtaTimeSelectorRowProps) {
  return <Highlight settingName={DeviceSetting.osAutoUpdate}>
    <Row>
      <Col xs={5}>
        <label>
          {t(DeviceSetting.osAutoUpdate)}
        </label>
        <Help text={Content.OS_AUTO_UPDATE} />
      </Col>
      <Col xs={ColWidth.description}>
        <OtaTimeSelector
          sourceFbosConfig={props.sourceFbosConfig}
          timeSettings={props.timeSettings}
          dispatch={props.dispatch}
          device={props.device} />
      </Col>
    </Row>
  </Highlight>;
}
