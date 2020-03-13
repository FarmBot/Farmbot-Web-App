import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { DeviceSetting, Content } from "../../../constants";
import { ColWidth } from "../farmbot_os_settings";
import { TimezoneRowProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { edit, save } from "../../../api/crud";
import { timezoneMismatch } from "../../timezones/guess_timezone";
import { TimezoneSelector } from "../../timezones/timezone_selector";
import { DevSettings } from "../../../account/dev/dev_support";

export class TimezoneRow extends React.Component<TimezoneRowProps> {

  Note = () =>
    <div className="note">
      {timezoneMismatch(this.props.device.body.timezone)
        ? t(Content.DIFFERENT_TZ_WARNING) : ""}
    </div>;

  Selector = () =>
    <TimezoneSelector
      currentTimezone={this.props.device.body.timezone}
      onUpdate={timezone => {
        this.props.dispatch(edit(this.props.device, { timezone }));
        this.props.dispatch(save(this.props.device.uuid));
      }} />;

  render() {
    const newFormat = DevSettings.futureFeaturesEnabled();

    return <Highlight settingName={DeviceSetting.timezone}>
      <Row>
        <Col xs={newFormat ? 12 : ColWidth.label}>
          <label>
            {t("TIME ZONE")}
          </label>
        </Col>
        {!newFormat &&
          <Col xs={ColWidth.description}>
            <this.Note />
            <this.Selector />
          </Col>}
      </Row>
      {newFormat && <Row>
        <Col xs={12}><this.Note /></Col>
        <Col xs={12} className="no-pad"><this.Selector /></Col>
      </Row>}
    </Highlight>;
  }
}
