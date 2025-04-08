import React from "react";
import { Row } from "../../ui";
import { DeviceSetting, Content } from "../../constants";
import { TimezoneRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { edit, save } from "../../api/crud";
import { timezoneMismatch } from "../../devices/timezones/guess_timezone";
import { TimezoneSelector } from "../../devices/timezones/timezone_selector";

export const TimezoneRow = (props: TimezoneRowProps) =>
  <Highlight settingName={DeviceSetting.timezone}>
    <Row className="grid-2-col timezone-grid">
      <label>
        {t(DeviceSetting.timezone)}
      </label>
      <TimezoneSelector
        currentTimezone={props.device.body.timezone}
        onUpdate={timezone => {
          props.dispatch(edit(props.device, { timezone }));
          props.dispatch(save(props.device.uuid));
        }} />
      <div className="note">
        {timezoneMismatch(props.device.body.timezone)
          ? t(Content.DIFFERENT_TZ_WARNING)
          : ""}
      </div>
    </Row>
  </Highlight>;
