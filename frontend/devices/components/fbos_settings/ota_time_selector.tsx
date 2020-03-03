import { DropDownItem, FBSelect, Row, Col } from "../../../ui";
import React from "react";
import { t } from "../../../i18next_wrapper";
import { TaggedDevice } from "farmbot";
import { edit, save } from "../../../api/crud";
import { ColWidth } from "../farmbot_os_settings";
import { DeviceSetting } from "../../../constants";
import { Highlight } from "../maybe_highlight";
import { OtaTimeSelectorRowProps } from "./interfaces";

// tslint:disable-next-line:no-null-keyword
const UNDEFINED = null as unknown as undefined;
const IMMEDIATELY = -1;
type PreferredHourFormat = "12h" | "24h";
type HOUR =
  | typeof IMMEDIATELY
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23;
type TimeTable = Record<HOUR, DropDownItem>;
type EveryTimeTable = Record<PreferredHourFormat, TimeTable>;
const ASAP = () => t("As soon as possible");
const TIME_TABLE_12H = (): TimeTable => ({
  0: { label: t("Midnight"), value: 0 },
  1: { label: "1:00 AM", value: 1 },
  2: { label: "2:00 AM", value: 2 },
  3: { label: "3:00 AM", value: 3 },
  4: { label: "4:00 AM", value: 4 },
  5: { label: "5:00 AM", value: 5 },
  6: { label: "6:00 AM", value: 6 },
  7: { label: "7:00 AM", value: 7 },
  8: { label: "8:00 AM", value: 8 },
  9: { label: "9:00 AM", value: 9 },
  10: { label: "10:00 AM", value: 10 },
  11: { label: "11:00 AM", value: 11 },
  12: { label: t("Noon"), value: 12 },
  13: { label: "1:00 PM", value: 13 },
  14: { label: "2:00 PM", value: 14 },
  15: { label: "3:00 PM", value: 15 },
  16: { label: "4:00 PM", value: 16 },
  17: { label: "5:00 PM", value: 17 },
  18: { label: "6:00 PM", value: 18 },
  19: { label: "7:00 PM", value: 19 },
  20: { label: "8:00 PM", value: 20 },
  21: { label: "9:00 PM", value: 21 },
  22: { label: "10:00 PM", value: 22 },
  23: { label: "11:00 PM", value: 23 },
  [IMMEDIATELY]: { label: ASAP(), value: IMMEDIATELY },
});
const TIME_TABLE_24H = (): TimeTable => ({
  0: { label: "00:00", value: 0 },
  1: { label: "01:00", value: 1 },
  2: { label: "02:00", value: 2 },
  3: { label: "03:00", value: 3 },
  4: { label: "04:00", value: 4 },
  5: { label: "05:00", value: 5 },
  6: { label: "06:00", value: 6 },
  7: { label: "07:00", value: 7 },
  8: { label: "08:00", value: 8 },
  9: { label: "09:00", value: 9 },
  10: { label: "10:00", value: 10 },
  11: { label: "11:00", value: 11 },
  12: { label: "12:00", value: 12 },
  13: { label: "13:00", value: 13 },
  14: { label: "14:00", value: 14 },
  15: { label: "15:00", value: 15 },
  16: { label: "16:00", value: 16 },
  17: { label: "17:00", value: 17 },
  18: { label: "18:00", value: 18 },
  19: { label: "19:00", value: 19 },
  20: { label: "20:00", value: 20 },
  21: { label: "21:00", value: 21 },
  22: { label: "22:00", value: 22 },
  23: { label: "23:00", value: 23 },
  [IMMEDIATELY]: { label: ASAP(), value: IMMEDIATELY },
});

const DEFAULT_HOUR: keyof TimeTable = IMMEDIATELY;
const TIME_FORMATS = (): EveryTimeTable => ({
  "12h": TIME_TABLE_12H(),
  "24h": TIME_TABLE_24H()
});

interface OtaTimeSelectorProps {
  disabled: boolean;
  timeFormat: PreferredHourFormat;
  onChange(hour24: number | undefined): void;
  value: number | undefined;
}

export const changeOtaHour =
  (dispatch: Function, device: TaggedDevice) =>
    (ota_hour: number) => {
      dispatch(edit(device, { ota_hour }));
      dispatch(save(device.uuid));
    };

export function assertIsHour(val: number | undefined): asserts val is (HOUR | undefined) {
  if ((val === null) || (val === undefined)) {
    return;
  }

  if (((val > 23) || (val < IMMEDIATELY))) {
    throw new Error("Not an hour!");
  }
}

/** Label and toggle button for opting in to FBOS beta releases. */
export const OtaTimeSelector = (props: OtaTimeSelectorProps): JSX.Element => {
  const { onChange, value, disabled } = props;
  assertIsHour(value);

  const cb = (ddi: DropDownItem) => {
    const v = parseInt("" + ddi.value, 10);
    if ((v == IMMEDIATELY)) {
      onChange(UNDEFINED);
    } else {
      onChange(v);
    }
  };

  const theTimeTable = TIME_FORMATS()[props.timeFormat];
  const list = Object
    .values(theTimeTable)
    .map(x => ({ ...x, label: t(x.label) }))
    .sort((_x, _y) => (_x.value > _y.value) ? 1 : -1);
  const selectedItem = (typeof value == "number") ?
    theTimeTable[value as HOUR] : theTimeTable[DEFAULT_HOUR];
  return <Row>
    <Highlight settingName={DeviceSetting.applySoftwareUpdates}>
      <Col xs={ColWidth.label}>
        <label>
          {t(DeviceSetting.applySoftwareUpdates)}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <FBSelect
          selectedItem={selectedItem}
          onChange={cb}
          list={list}
          extraClass={disabled ? "disabled" : ""} />
      </Col>
    </Highlight>
  </Row>;
};

export function OtaTimeSelectorRow(props: OtaTimeSelectorRowProps) {
  const osAutoUpdate = props.sourceFbosConfig("os_auto_update");
  const timeFormat = props.timeSettings.hour24 ? "24h" : "12h";
  return <OtaTimeSelector
    timeFormat={timeFormat}
    disabled={!osAutoUpdate.value}
    value={props.device.body.ota_hour}
    onChange={changeOtaHour(props.dispatch, props.device)} />;
}
