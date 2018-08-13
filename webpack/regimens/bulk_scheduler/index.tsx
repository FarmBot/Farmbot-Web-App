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
import { betterCompact, trim, bail } from "../../util";
import { isParameterized } from "../../sequences/is_parameterized";
import { error } from "farmbot-toastr";

export const NO_PARAMETERS = trim(`Can't directly use this sequence in a
  regimen. Consider wrapping it in a parent sequence that calls it via "execute"
  instead."`);
const BAD_UUID = "WARNING: Not a sequence UUID.";

export class BulkScheduler extends React.Component<BulkEditorProps, {}> {
  selected = (): DropDownItem => {
    const s = this.props.selectedSequence;
    return (s && s.body.id) ? { label: s.body.name, value: s.uuid } : NULL_CHOICE;
  };

  all = (): DropDownItem[] => {
    return betterCompact(this.props.sequences.map(x => {
      if (x.body.id) {
        return { value: x.uuid, label: x.body.name };
      }
    }));
  };

  commitChange = (uuid: string) => {
    const s = this.props.sequences.filter(x => x.uuid == uuid)[0];
    s && isParameterized(s.body) && error(t(NO_PARAMETERS));

    this.props.dispatch(setSequence(uuid));
  }

  onChange = (event: DropDownItem) => {
    const uuid = event.value;
    _.isString(uuid) ? this.commitChange(uuid) : bail(BAD_UUID);
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
      <WeekGrid weeks={weeks} dispatch={dispatch} />
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
