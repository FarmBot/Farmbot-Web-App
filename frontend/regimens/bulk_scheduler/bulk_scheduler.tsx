import React from "react";
import { BulkEditorProps } from "./interfaces";
import { WeekGrid } from "./week_grid";
import { setTimeOffset, setSequence } from "./actions";
import {
  BlurableInput, Row, FBSelect, DropDownItem, NULL_CHOICE,
} from "../../ui";
import moment from "moment";
import { isString, isUndefined } from "lodash";
import { betterCompact, bail } from "../../util";
import { msToTime, timeToMs } from "./utils";
import { t } from "../../i18next_wrapper";
import { Content } from "../../constants";

const BAD_UUID = "WARNING: Not a sequence UUID.";

export class BulkScheduler extends React.Component<BulkEditorProps, {}> {
  selected = (): DropDownItem => {
    const s = this.props.selectedSequence;
    return (s?.body.id)
      ? { label: s.body.name, value: s.uuid }
      : NULL_CHOICE;
  };

  all = (): DropDownItem[] => {
    return betterCompact(this.props.sequences.map(x => {
      if (x.body.id) {
        return { value: x.uuid, label: x.body.name };
      }
    }));
  };

  commitChange = (uuid: string) => {
    this.props.dispatch(setSequence(uuid));
  };

  onChange = (event: DropDownItem) => {
    const uuid = event.value;
    isString(uuid) ? this.commitChange(uuid) : bail(BAD_UUID);
  };

  SequenceSelectBox = () =>
    <div className="grid half-gap">
      <label>{t("Sequence")}</label>
      <FBSelect onChange={this.onChange}
        selectedItem={this.selected()}
        list={this.all()} />
    </div>;

  TimeSelection = () =>
    <div className={"grid no-gap"}>
      <div className={"row no-gap grid-exp-2"}>
        <label>{t("Time")}</label>
        <i className="fa fa-clock-o fb-icon-button invert" onClick={() =>
          this.props.dispatch(setTimeOffset(timeToMs(
            moment().add(3, "minutes").format("HH:mm"))))} />
      </div>
      <BlurableInput type="time"
        value={msToTime(this.props.dailyOffsetMs)}
        error={nearOsUpdateTime(
          this.props.dailyOffsetMs,
          this.props.device.body.ota_hour)
          ? t(Content.WITHIN_HOUR_OF_OS_UPDATE)
          : undefined}
        onCommit={({ currentTarget }) => {
          this.props.dispatch(setTimeOffset(timeToMs(currentTarget.value)));
        }} />
    </div>;

  render() {
    const { dispatch, weeks } = this.props;
    return <div className="grid double-gap">
      <Row className="grid-2-col">
        <this.SequenceSelectBox />
        <this.TimeSelection />
      </Row>
      <WeekGrid weeks={weeks} dispatch={dispatch} />
    </div>;
  }
}

export const nearOsUpdateTime =
  (dailyOffsetMs: number, otaHour: number | undefined) => {
    if (isUndefined(otaHour)) { return; }
    const otaHourString = otaHour + ":00";
    const oneHourInMs = 60 * 60 * 1000;
    const difference = dailyOffsetMs - timeToMs(otaHourString);
    const spillover = otaHour == 0 && dailyOffsetMs > 23 * 60 * 60 * 1000;
    return Math.abs(difference) < oneHourInMs || spillover;
  };
