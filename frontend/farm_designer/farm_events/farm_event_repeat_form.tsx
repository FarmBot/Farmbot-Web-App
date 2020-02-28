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

export interface FarmEventRepeatFormProps {
  /** Should the form controls be grayed out? */
  disabled: boolean;
  /** Should the form be shown _at all_? */
  hidden: boolean;
  fieldSet(key: keyof FarmEventViewModel, value: string): void;
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

export function FarmEventRepeatForm(props: FarmEventRepeatFormProps) {
  const { disabled, fieldSet, repeat, endDate, endTime, timeUnit } = props;
  return props.hidden
    ? <div className={"no-repeat-form"} />
    : <div className="farm-event-repeat-form">
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
            onCommit={e => fieldSet("repeat", e.currentTarget.value)}
            min={1} />
        </Col>
        <Col xs={8}>
          <FBSelect
            list={repeatOptions}
            onChange={ddi => fieldSet("timeUnit", "" + ddi.value)}
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
            onCommit={e => fieldSet("endDate", e.currentTarget.value)}
            error={props.dateError} />
        </Col>
        <Col xs={6}>
          <EventTimePicker
            disabled={disabled}
            className="add-event-end-time"
            name="endTime"
            timeSettings={props.timeSettings}
            value={endTime}
            onCommit={e => fieldSet("endTime", e.currentTarget.value)}
            error={props.timeError} />
        </Col>
      </Row>
    </div>;
}
