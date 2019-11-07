import { DropDownItem, FBSelect } from "../../../../ui";
import React from "react";
import { t } from "../../../../i18next_wrapper";
import { TaggedDevice } from "farmbot";
import { edit, save } from "../../../../api/crud";

const OTA_TIMES: Record<number, DropDownItem> = {
  0: { label: "Midnight", value: 0 },
  1: { label: "1 AM", value: 1 },
  2: { label: "2 AM", value: 2 },
  3: { label: "3 AM", value: 3 },
  4: { label: "4 AM", value: 4 },
  5: { label: "5 AM", value: 5 },
  6: { label: "6 AM", value: 6 },
  7: { label: "7 AM", value: 7 },
  8: { label: "8 AM", value: 8 },
  9: { label: "9 AM", value: 9 },
  10: { label: "10 AM", value: 10 },
  11: { label: "11 AM", value: 11 },
  12: { label: "Noon", value: 12 },
  13: { label: "1 PM", value: 13 },
  14: { label: "2 PM", value: 14 },
  15: { label: "3 PM", value: 15 },
  16: { label: "4 PM", value: 16 },
  17: { label: "5 PM", value: 17 },
  18: { label: "6 PM", value: 18 },
  19: { label: "7 PM", value: 19 },
  20: { label: "8 PM", value: 20 },
  21: { label: "9 PM", value: 21 },
  22: { label: "10 PM", value: 22 },
  23: { label: "11 PM", value: 23 },
};

const DEFAULT_HOUR = OTA_TIMES[3];

interface OtaTimeSelectorProps {
  onChange(hour24: number): void;
  value: number;
}

export const changeOtaHour =
  (dispatch: Function, device: TaggedDevice) =>
    (ota_hour: number) => {
      dispatch(edit(device, { ota_hour }));
      dispatch(save(device.uuid));
    };
/** Label and toggle button for opting in to FBOS beta releases. */
export const OtaTimeSelector = ({ onChange, value }: OtaTimeSelectorProps): JSX.Element => {
  return <fieldset className={"os-release-channel"}>
    <label>
      {t("Perform Software Updates At: ")}
    </label>
    <FBSelect
      selectedItem={OTA_TIMES[value] || DEFAULT_HOUR}
      onChange={ddi => onChange(ddi.value as number)}
      list={Object.values(OTA_TIMES)} />
  </fieldset>;
};
