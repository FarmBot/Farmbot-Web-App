import * as React from "react";
import { t } from "i18next";
import { FarmbotOsProps, FarmbotOsState } from "../interfaces";
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
import { LastSeen } from "./fbos_settings/last_seen_row";
import { CameraSelection } from "./fbos_settings/camera_selection";
import { BoardType } from "./fbos_settings/board_type";
import { FarmbotOsRow } from "./fbos_settings/farmbot_os_row";
import { AutoUpdateRow } from "./fbos_settings/auto_update_row";
import { AutoSyncRow } from "./fbos_settings/auto_sync_row";
import { isUndefined } from "lodash";
import { PowerAndReset } from "./fbos_settings/power_and_reset";
import axios from "axios";

export enum ColWidth {
  label = 3,
  description = 7,
  button = 2
}

const OS_RELEASE_NOTES_URL =
  "https://raw.githubusercontent.com/FarmBot/farmbot_os/staging/RELEASE_NOTES.md";

export class FarmbotOsSettings
  extends React.Component<FarmbotOsProps, FarmbotOsState> {
  state = { osReleaseNotes: "" };

  componentDidMount() {
    this.fetchReleaseNotes(OS_RELEASE_NOTES_URL,
      (this.props.bot.hardware.informational_settings
        .controller_version || "6").split(".")[0]);
  }

  fetchReleaseNotes = (url: string, osMajorVersion: string) => {
    axios
      .get<string>(url)
      .then(resp => {
        const notes = resp.data
          .split("# v")
          .filter(x => x.startsWith(osMajorVersion))[0]
          .split("\n\n").join("\n");
        const osReleaseNotes = "# FarmBot OS v" + notes;
        this.setState({ osReleaseNotes });
      })
      .catch(() =>
        this.setState({ osReleaseNotes: "Could not get release notes." }));
  }

  changeBot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { account, dispatch } = this.props;
    dispatch(edit(account, { name: e.currentTarget.value }));
  }

  updateBot = (e: React.MouseEvent<{}>) => {
    const { account, dispatch } = this.props;
    dispatch(save(account.uuid));
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
      botToMqttLastSeen={this.props.botToMqttLastSeen}
      device={this.props.account} />;
  }

  render() {
    const { bot, account, sourceFbosConfig } = this.props;
    const { firmware_version, sync_status } = bot.hardware.informational_settings;
    return <Widget className="device-widget">
      <form onSubmit={(e) => e.preventDefault()}>
        <WidgetHeader title="Device" helpText={ToolTips.OS_SETTINGS}>
          <SaveBtn
            status={account.specialStatus}
            onClick={this.updateBot} />
        </WidgetHeader>
        <WidgetBody>
          <Row>
            <Col xs={ColWidth.label}>
              <label>
                {t("NAME")}
              </label>
            </Col>
            <Col xs={9}>
              <input name="name"
                onChange={this.changeBot}
                value={this.props.account.body.name} />
            </Col>
          </Row>
          <Row>
            <Col xs={ColWidth.label}>
              <label>
                {t("TIME ZONE")}
              </label>
            </Col>
            <Col xs={ColWidth.description}>
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
            syncStatus={sync_status}
            networkState={this.props.botToMqttStatus}
            lockOpen={process.env.NODE_ENV !== "production"}>
            <FarmbotOsRow
              bot={this.props.bot}
              osReleaseNotes={this.state.osReleaseNotes}
              dispatch={this.props.dispatch}
              sourceFbosConfig={sourceFbosConfig} />
            <AutoUpdateRow
              dispatch={this.props.dispatch}
              sourceFbosConfig={sourceFbosConfig} />
            {(location.host.includes("localhost")
              || !isUndefined(sourceFbosConfig("auto_sync").value)) &&
              <AutoSyncRow
                dispatch={this.props.dispatch}
                sourceFbosConfig={sourceFbosConfig} />}
            <CameraSelection env={this.props.bot.hardware.user_env} />
            <BoardType
              firmwareVersion={firmware_version}
              dispatch={this.props.dispatch}
              sourceFbosConfig={sourceFbosConfig} />
            <PowerAndReset
              controlPanelState={this.props.bot.controlPanelState}
              dispatch={this.props.dispatch}
              sourceFbosConfig={sourceFbosConfig}
              shouldDisplay={this.props.shouldDisplay} />
          </MustBeOnline>
        </WidgetBody>
      </form>
    </Widget>;
  }
}
