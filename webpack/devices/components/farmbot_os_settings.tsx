import * as React from "react";
import { t } from "i18next";
import { FarmbotOsProps } from "../interfaces";
import { saveAccountChanges } from "../actions";
import {
  Widget,
  WidgetHeader,
  WidgetBody,
  Row,
  Col,
  SaveBtn
} from "../../ui/index";
import { save, edit, refresh } from "../../api/crud";
import { MustBeOnline } from "../must_be_online";
import { ToolTips, Content } from "../../constants";
import { TimezoneSelector } from "../timezones/timezone_selector";
import { timezoneMismatch } from "../timezones/guess_timezone";
import { LastSeen } from "./last_seen_widget";
import { CameraSelection } from "./camera_selection";
import { BoardType } from "./board_type";
import { AutoUpdateRow } from "./fbos_settings/auto_update_row";
import { RestartRow } from "./fbos_settings/restart_row";
import { ShutdownRow } from "./fbos_settings/shutdown_row";
import { FactoryResetRow } from "./fbos_settings/factory_reset_row";
import { AutoSyncRow } from "./fbos_settings/auto_sync_row";
import { isUndefined } from "lodash";

export class FarmbotOsSettings
  extends React.Component<FarmbotOsProps> {

  changeBot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { account, dispatch } = this.props;
    dispatch(edit(account, { name: e.currentTarget.value }));
  }

  saveBot(e: React.MouseEvent<{}>) {
    e.preventDefault();
    this.props.dispatch(save(this.props.account.uuid));
  }

  updateBot = (e: React.MouseEvent<{}>) => {
    this.props.dispatch(saveAccountChanges);
  }

  handleTimezone = (timezone: string) => {
    const { account, dispatch } = this.props;
    dispatch(edit(account, { timezone }));
    dispatch(save(account.uuid));
  }

  maybeWarnTz = () => {
    const wrongTZ = timezoneMismatch(this.props.account.body.timezone);
    if (wrongTZ) {
      return Content.DIFFERENT_TZ_WARNING;
    } else {
      return "";
    }
  }

  lastSeen = () => {
    return <LastSeen
      onClick={() => this.props.dispatch(refresh(this.props.account))}
      device={this.props.account} />;
  }

  // TODO: Delete this function on 1 Jan 2018. This is a backwards compatibility
  //       fix. - RC
  maybeShowAutoSync = () => {
    const { auto_sync } = this.props.bot.hardware.configuration;
    const isDevMode = location.host.includes("localhost"); // Enable in dev.
    // Old FBOS => no auto_sync option => breaks when toggled.
    const properFbosVersion = !isUndefined(auto_sync);

    if (isDevMode || properFbosVersion) {
      return <AutoSyncRow currentValue={!!auto_sync} />;
    }
  }

  render() {
    const { account } = this.props;
    const { hardware } = this.props.bot;
    const { firmware_version } = hardware.informational_settings;
    const { controller_version } = hardware.informational_settings;

    return <Widget className="device-widget">
      <form onSubmit={this.saveBot.bind(this)}>
        <WidgetHeader title="Device" helpText={ToolTips.OS_SETTINGS}>
          <SaveBtn
            status={account.specialStatus}
            onClick={this.updateBot} />
        </WidgetHeader>
        <WidgetBody>
          <Row>
            <Col xs={2}>
              <label>
                {t("NAME")}
              </label>
            </Col>
            <Col xs={10}>
              <input name="name"
                onChange={this.changeBot}
                value={this.props.account.body.name} />
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <label>
                {t("TIME ZONE")}
              </label>
            </Col>
            <Col xs={7}>
              <div className="note">
                {this.maybeWarnTz()}
              </div>
              <div>
                <TimezoneSelector
                  currentTimezone={this.props.account.body.timezone}
                  onUpdate={this.handleTimezone} />
              </div>
            </Col>
          </Row>
          <this.lastSeen />
          <MustBeOnline
            status={hardware.informational_settings.sync_status}
            lockOpen={process.env.NODE_ENV !== "production"}>
            <AutoUpdateRow bot={this.props.bot} controller_version={controller_version} />
            <RestartRow />
            <ShutdownRow />
            <FactoryResetRow />
            {this.maybeShowAutoSync()}
            <CameraSelection env={hardware.user_env} />
            <BoardType firmwareVersion={firmware_version} />
          </MustBeOnline>
        </WidgetBody>
      </form>
    </Widget>;
  }
}
