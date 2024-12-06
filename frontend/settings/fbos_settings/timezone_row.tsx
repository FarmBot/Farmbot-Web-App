import React from "react";
import { Row } from "../../ui";
import { DeviceSetting, Content } from "../../constants";
import { TimezoneRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { edit, save } from "../../api/crud";
import { timezoneMismatch } from "../../devices/timezones/guess_timezone";
import { TimezoneSelector } from "../../devices/timezones/timezone_selector";

export class TimezoneRow extends React.Component<TimezoneRowProps> {

  Note = () =>
    <div className="note">
      {timezoneMismatch(this.props.device.body.timezone)
        ? t(Content.DIFFERENT_TZ_WARNING)
        : ""}
    </div>;

  Selector = () =>
    <TimezoneSelector
      currentTimezone={this.props.device.body.timezone}
      onUpdate={timezone => {
        this.props.dispatch(edit(this.props.device, { timezone }));
        this.props.dispatch(save(this.props.device.uuid));
      }} />;

  render() {
    return <Highlight settingName={DeviceSetting.timezone}>
      <Row className="grid-2-col timezone-grid">
        <label>
          {t(DeviceSetting.timezone)}
        </label>
        <this.Selector />
        <this.Note />
      </Row>
    </Highlight>;
  }
}
