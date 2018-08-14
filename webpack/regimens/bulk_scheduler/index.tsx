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
import { betterCompact, bail } from "../../util";
import { maybeWarnAboutParameters, msToTime, timeToMs } from "./utils";

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
    maybeWarnAboutParameters(s);
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
