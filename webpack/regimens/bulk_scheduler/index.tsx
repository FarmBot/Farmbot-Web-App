import * as React from "react";
import { BulkEditorProps } from "./interfaces";
import { AddButton } from "./add_button";
import { WeekGrid } from "./week_grid";
import { commitBulkEditor, setTimeOffset, setSequence } from "./actions";
import {
  BlurableInput, Row, Col, FBSelect, DropDownItem, NULL_CHOICE
} from "../../ui/index";
import * as moment from "moment";
import { t } from "i18next";
import * as _ from "lodash";
import { betterCompact } from "../../util";

export class BulkScheduler extends React.Component<BulkEditorProps, {}> {
  selected = (): DropDownItem => {
    const s = this.props.selectedSequence;
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
    const {
      dispatch,
      dailyOffsetMs,
      weeks,
      sequences
    } = this.props;
    const active = !!(sequences && sequences.length);
    return <div>
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
            <i className="fa fa-clock-o" onClick={() =>
              this.props.dispatch(setTimeOffset(timeToMs(
                moment().add(3, "minutes").format("HH:mm"))))
            } />
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
    const d = moment.duration(ms);
    const h = _.padStart(d.hours().toString(), 2, "0");
    const m = _.padStart(d.minutes().toString(), 2, "0");
    return `${h}:${m}`;
  } else {
    return "00:01";
  }
}

function timeToMs(input: string) {
  const [hours, minutes] = input
    .split(":")
    .map((n: string) => parseInt(n, 10));
  return ((hours * 60) + (minutes)) * 60 * 1000;
}
