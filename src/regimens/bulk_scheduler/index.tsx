import * as React from "react";
import { BulkEditorProps } from "./interfaces";
import { AddButton } from "./add_button";
import { WeekGrid } from "./week_grid";
import { commitBulkEditor, setTimeOffset, setSequence } from "./actions";
import { ToolTip, Row, Col, DropDownItem } from "../../ui/index";
import { BlurableInput } from "../../ui/blurable_input";
import { duration } from "moment";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import * as _ from "lodash";
import { betterCompact } from "../../util";
import { NULL_CHOICE, FBSelect } from "../../ui/new_fb_select";

export class BulkSchedulerWidget extends React.Component<BulkEditorProps, {}> {
  selected = (): DropDownItem => {
    let s = this.props.selectedSequence;
    if (s && s.body.id) {
      return {
        label: s.body.name,
        value: s.uuid
      };
    } else {
      return NULL_CHOICE;
    }
  };

  all = (): DropDownItem[] => {
    return betterCompact(this
      .props
      .sequences
      .map(x => {
        if (x.body.id) {
          return { value: x.uuid, label: x.body.name };
        }
      }));
  };

  onChange = (event: DropDownItem) => {
    if (_.isString(event.value)) {
      this.props.dispatch(setSequence(event.value));
    } else {
      throw new Error("WARNING: Not a sequence UUID.");
    }
  }

  render() {
    let {
      dispatch,
      selectedSequence,
      dailyOffsetMs,
      weeks,
      sequences
    } = this.props;
    let active = !!(sequences && sequences.length);
    return <div className="bulk-scheduler">
      <h3>
        <i>{t("Scheduler")}</i>
      </h3>
      <ToolTip helpText={ToolTips.BULK_SCHEDULER} />
      <AddButton
        active={active}
        click={() => { dispatch(commitBulkEditor()); }} />
      <Row>
        <Col xs={6}>
          <div>
            <label>{t("Sequence")}</label>
            <FBSelect onChange={this.onChange}
              selectedItem={this.selected()}
              list={this.all()}
              placeholder="Pick a sequence (or save a new one)" />
          </div>
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
      <WeekGrid weeks={weeks}
        dispatch={dispatch} />
    </div>;
  }
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
