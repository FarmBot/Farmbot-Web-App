import { DropDownItem, FBSelect, Row, Col } from "../../../../ui";
import React from "react";
import { t } from "../../../../i18next_wrapper";
import { TaggedDevice } from "farmbot";
import { edit, save } from "../../../../api/crud";
import { ColWidth } from "../../farmbot_os_settings";

const IMMEDIATELY = -1;

// tslint:disable-next-line:no-null-keyword
const UNDEFINED = null as unknown as undefined;

const OTA_TIMES: Record<number, DropDownItem> = {
  0: { label: "at Midnight", value: 0 },
  1: { label: "at 1 AM", value: 1 },
  2: { label: "at 2 AM", value: 2 },
  3: { label: "at 3 AM", value: 3 },
  4: { label: "at 4 AM", value: 4 },
  5: { label: "at 5 AM", value: 5 },
  6: { label: "at 6 AM", value: 6 },
  7: { label: "at 7 AM", value: 7 },
  8: { label: "at 8 AM", value: 8 },
  9: { label: "at 9 AM", value: 9 },
  10: { label: "at 10 AM", value: 10 },
  11: { label: "at 11 AM", value: 11 },
  12: { label: "at Noon", value: 12 },
  13: { label: "at 1 PM", value: 13 },
  14: { label: "at 2 PM", value: 14 },
  15: { label: "at 3 PM", value: 15 },
  16: { label: "at 4 PM", value: 16 },
  17: { label: "at 5 PM", value: 17 },
  18: { label: "at 6 PM", value: 18 },
  19: { label: "at 7 PM", value: 19 },
  20: { label: "at 8 PM", value: 20 },
  21: { label: "at 9 PM", value: 21 },
  22: { label: "at 10 PM", value: 22 },
  23: { label: "at 11 PM", value: 23 },
  [IMMEDIATELY]: { label: "as soon as possible", value: IMMEDIATELY },
};

const DEFAULT_HOUR = OTA_TIMES[IMMEDIATELY];

interface OtaTimeSelectorProps {
  disabled: boolean;
  onChange(hour24: number | undefined): void;
  value: number | undefined;
}

export const changeOtaHour =
  (dispatch: Function, device: TaggedDevice) =>
    (ota_hour: number) => {
      dispatch(edit(device, { ota_hour }));
      dispatch(save(device.uuid));
    };
/** Label and toggle button for opting in to FBOS beta releases. */
export const OtaTimeSelector = (props: OtaTimeSelectorProps): JSX.Element => {
  const { onChange, value, disabled } = props;
  const cb = (ddi: DropDownItem) => {
    const v = parseInt("" + ddi.value, 10);
    if ((v == IMMEDIATELY)) {
      onChange(UNDEFINED);
    } else {
      onChange(v);
    }
  };

  const list = Object
    .values(OTA_TIMES)
    .map(x => ({ ...x, label: t(x.label) }));

  return <Row>
    <Col xs={ColWidth.label}>
      <label>
        {t("Apply Software Updates ")}
      </label>
    </Col>
    <Col xs={ColWidth.description}>
      <FBSelect
        selectedItem={value ? OTA_TIMES[value] : DEFAULT_HOUR}
        onChange={cb}
        list={list}
        extraClass={disabled ? "disabled" : ""} />
    </Col>
  </Row>;
};
