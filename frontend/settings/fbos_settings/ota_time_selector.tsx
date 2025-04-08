import React from "react";
import moment from "moment";
import { t } from "../../i18next_wrapper";
import { FBSelect, Row, DropDownItem, Help } from "../../ui";
import { edit, save } from "../../api/crud";
import { Content, DeviceSetting } from "../../constants";
import { Highlight } from "../maybe_highlight";
import { OtaTimeSelectorProps, OtaTimeSelectorRowProps } from "./interfaces";
import { isNumber, range } from "lodash";
import { getModifiedClassNameSpecifyDefault } from "../default_values";
import { updateConfig } from "../../devices/actions";

export const localHourToUtcHour =
  (hour: number | undefined, offset: number, direction = 1): number | undefined =>
    !isNumber(hour) ? undefined : (hour - (direction * offset)) % 24;

export const utcHourToLocalHour = (hour: number | undefined, offset: number) =>
  localHourToUtcHour(hour, offset, -1);

export const DDI_ASAP = (): DropDownItem =>
  ({ label: t("As soon as possible"), value: "", isNull: true });
const DDI_NEVER = (): DropDownItem => ({ label: t("Never"), value: "never" });

const formatHour = (hour: number | undefined, hour24: boolean) =>
  !isNumber(hour)
    ? DDI_ASAP().label
    : moment().startOf("day")
      .add(hour, "hours")
      .format(hour24 ? "H:mm" : "h:mm A");

export const OtaTimeSelector = (props: OtaTimeSelectorProps) => {
  const { device, dispatch, timeSettings } = props;
  const { utcOffset, hour24 } = timeSettings;
  const localHour = utcHourToLocalHour(device.body.ota_hour_utc, utcOffset) ??
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
        ota_hour_utc: localHourToUtcHour(newLocalHour, utcOffset),
      }));
      dispatch(save(device.uuid));
    }}
    list={[DDI_ASAP()].concat(range(24)
      .map((hour: number): DropDownItem =>
        ({ label: formatHour(hour, hour24), value: hour }))
      .concat(DDI_NEVER()))}
    customNullLabel={DDI_ASAP().label}
    extraClass={[
      !osAutoUpdate.consistent ? "dim" : "",
      getModifiedClassNameSpecifyDefault(localHour, 3),
      getModifiedClassNameSpecifyDefault(osAutoUpdate.value, true),
    ].join(" ")} />;
};

export const OtaTimeSelectorRow = (props: OtaTimeSelectorRowProps) =>
  <Highlight settingName={DeviceSetting.osAutoUpdate}
    hidden={!props.showAdvanced}
    className={"advanced"}>
    <Row className="grid-2-col">
      <div>
        <label>
          {t(DeviceSetting.osAutoUpdate)}
        </label>
        <Help text={Content.OS_AUTO_UPDATE} />
      </div>
      <OtaTimeSelector
        sourceFbosConfig={props.sourceFbosConfig}
        timeSettings={props.timeSettings}
        dispatch={props.dispatch}
        device={props.device} />
    </Row>
  </Highlight>;
