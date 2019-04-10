import * as React from "react";
import {
  Row, Col, BlurableInput, FBSelect, DropDownItem
} from "../../ui/index";
import { repeatOptions } from "./map_state_to_props_add_edit";
import { keyBy } from "lodash";
import { FarmEventViewModel } from "./edit_fe_form";
import { EventTimePicker } from "./event_time_picker";
import { TimeUnit } from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";

type Ev = React.SyntheticEvent<HTMLInputElement>;
type Key = keyof FarmEventViewModel;

export interface RepeatFormProps {
  /** Should the form controls be grayed out? */
  disabled: boolean;
  /** Should the form be shown _at all_? */
  hidden: boolean;
  onChange(key: Key, value: string): void;
  timeUnit: TimeUnit;
  repeat: string;
  endDate: string;
  endTime: string;
  timeSettings: TimeSettings;
  dateError?: string;
  timeError?: string;
}

const indexKey: keyof DropDownItem = "value";
const OPTN_LOOKUP = keyBy(repeatOptions, indexKey);

export function FarmEventRepeatForm(props: RepeatFormProps) {
  const { disabled, onChange, repeat, endDate, endTime, timeUnit } = props;
  const changeHandler =
    (key: Key) => (e: Ev) => onChange(key, e.currentTarget.value);
  return props.hidden ? <div /> : <div>
    <label>
      {t("Every")}
    </label>
    <Row>
      <Col xs={4}>
        <BlurableInput
          disabled={disabled}
          placeholder="(Number)"
          type="number"
          className="add-event-repeat-frequency"
          name="repeat"
          value={repeat}
          onCommit={changeHandler("repeat")}
          min={1} />
      </Col>
      <Col xs={8}>
        <FBSelect
          list={repeatOptions}
          onChange={(e) => onChange("timeUnit", "" + e.value)}
          selectedItem={OPTN_LOOKUP[timeUnit] || OPTN_LOOKUP["daily"]} />
      </Col>
    </Row>
    <label>
      {t("Until")}
    </label>
    <Row>
      <Col xs={6}>
        <BlurableInput
          disabled={disabled}
          type="date"
          className="add-event-end-date"
          name="endDate"
          value={endDate}
          onCommit={changeHandler("endDate")}
          error={props.dateError} />
      </Col>
      <Col xs={6}>
        <EventTimePicker
          disabled={disabled}
          className="add-event-end-time"
          name="endTime"
          timeSettings={props.timeSettings}
          value={endTime}
          onCommit={changeHandler("endTime")}
          error={props.timeError} />
      </Col>
    </Row>
  </div>;
}
