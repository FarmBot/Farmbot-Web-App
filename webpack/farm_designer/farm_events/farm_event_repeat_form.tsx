import * as React from "react";
import { t } from "i18next";
import { Row, Col, BlurableInput, DropDownItem } from "../../ui/index";
import { FBSelect } from "../../ui/new_fb_select";
import { repeatOptions } from "./map_state_to_props_add_edit";
import { keyBy } from "lodash";
import { TimeUnit } from "../interfaces";
import { FarmEventViewModel } from "./edit_fe_form";

type Ev = React.SyntheticEvent<HTMLInputElement>;
type Key = keyof FarmEventViewModel;

export interface RepeatFormProps {
  /** Should the form controls be grayed out? */
  disabled: boolean;
  /** Should the form be show _at all_? */
  hidden: boolean;
  onChange(key: Key, value: string): void;
  timeUnit: TimeUnit;
  repeat: string;
  endDate: string;
  endTime: string;
}

let indexKey: keyof DropDownItem = "value";
const OPTN_LOOKUP = keyBy(repeatOptions, indexKey);

export function FarmEventRepeatForm(props: RepeatFormProps) {
  let { disabled, onChange, repeat, endDate, endTime, timeUnit } = props;
  let changeHandler =
    (key: Key) => (e: Ev) => onChange(key, e.currentTarget.value);
  if (props.hidden) {
    return <div />;
  } else {
    return <div>
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
            onCommit={changeHandler("repeat")} />
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
            onCommit={changeHandler("endDate")} />
        </Col>
        <Col xs={6}>
          <BlurableInput
            disabled={disabled}
            type="time"
            className="add-event-end-time"
            name="endTime"
            value={endTime}
            onCommit={changeHandler("endTime")} />
        </Col>
      </Row>
    </div>;
  }
}
