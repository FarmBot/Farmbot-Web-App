import * as React from "react";
import { BulkEditorProps } from "./interfaces";
import { AddButton } from "./add_button";
import { SequenceList } from "./sequence_list";
import { WeekGrid } from "./week_grid";
import { commitBulkEditor, setTimeOffset } from "./actions";
import { ToolTip, Row, Col } from "../../ui/index";
import { BlurableInput } from "../../ui/blurable_input";
import { duration } from "moment";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import * as _ from "lodash";

export function BulkSchedulerWidget(props: BulkEditorProps) {
  let { dispatch, sequences, selectedSequence, dailyOffsetMs } = props;
  let active = !!(sequences && sequences.length);
  return <div className="bulk-scheduler">
    <h3>
      <i>{t("Scheduler")}</i>
    </h3>
    <ToolTip helpText={ToolTips.BULK_SCHEDULER} />
    <AddButton
      active={active}
      click={() => { dispatch(commitBulkEditor()); }}
    />
    <Row>
      <Col xs={6}>
        <SequenceList sequences={sequences}
          current={selectedSequence}
          dispatch={dispatch} />
      </Col>
      <Col xs={6}>
        <div>
          <label>{t("Time")}</label>
          <BlurableInput type="time"
            value={msToTime(dailyOffsetMs)}
            onCommit={({ currentTarget }) => {
              dispatch(setTimeOffset(timeToMs(currentTarget.value)));
            }} />
        </div>
      </Col>
    </Row>
    <WeekGrid weeks={props.weeks}
      dispatch={dispatch} />
  </div>;
}

function msToTime(ms: number) {
  if (_.isNumber(ms)) {
    let d = duration(ms);
    let h = _.padStart(d.hours().toString(), 2, "0");
    let m = _.padStart(d.minutes().toString(), 2, "0");
    return `${h}:${m}`;
  } else {
    return "00:01";
  }
}

function timeToMs(input: string) {
  let [hours, minutes] = input
    .split(":")
    .map((n: string) => parseInt(n, 10));
  return ((hours * 60) + (minutes)) * 60 * 1000;
}
