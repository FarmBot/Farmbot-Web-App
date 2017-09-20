import * as React from "react";
import { t } from "i18next";
import { FarmbotOsProps } from "../interfaces";
import {
  saveAccountChanges,
  reboot,
  powerOff,
  factoryReset
} from "../actions";
import { OsUpdateButton } from "./os_update_button";
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

  render() {
    const { account } = this.props;

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
          <Row>
            <Col xs={2}>
              <label>
                {t("NETWORK")}
              </label>
            </Col>
            <Col xs={10}>
              <p>
                {this.props.bot.connectedToMQTT ?
                  "connected to " : "OFFLINE! "}
                {`mqtt://${this.props.auth.token.unencoded.mqtt}`}
              </p>
            </Col>
          </Row>
          <this.lastSeen />
          <MustBeOnline
            fallback="Some settings are not available when FarmBot is offline."
            status={this.props.bot.hardware.informational_settings.sync_status}
            lockOpen={process.env.NODE_ENV !== "production"}>
            <Row>
              <Col xs={2}>
                <label>
                  {t("FARMBOT OS")}
                </label>
              </Col>
              <Col xs={3}>
                <p>
                  {t("Version {{ version }}", {
                    version:
                    this
                      .props
                      .bot
                      .hardware
                      .informational_settings.controller_version
                    || t(" unknown (offline)")
                  }
                  )}
                </p>
              </Col>
              <Col xs={7}>
                <OsUpdateButton bot={this.props.bot} />
              </Col>
            </Row>
            <Row>
              <Col xs={2}>
                <label>
                  {t("RESTART FARMBOT")}
                </label>
              </Col>
              <Col xs={7}>
                <p>
                  {t(Content.RESTART_FARMBOT)}
                </p>
              </Col>
              <Col xs={3}>
                <button
                  className="fb-button yellow"
                  type="button"
                  onClick={reboot}>
                  {t("RESTART")}
                </button>
              </Col>
            </Row>
            <Row>
              <Col xs={2}>
                <label>
                  {t("SHUTDOWN FARMBOT")}
                </label>
              </Col>
              <Col xs={7}>
                <p>
                  {t(Content.SHUTDOWN_FARMBOT)}
                </p>
              </Col>
              <Col xs={3}>
                <button
                  className="fb-button red"
                  type="button"
                  onClick={powerOff}>
                  {t("SHUTDOWN")}
                </button>
              </Col>
            </Row>
            <Row>
              <Col xs={2}>
                <label>
                  {t("Factory Reset")}
                </label>
              </Col>
              <Col xs={7}>
                <p>
                  {t(Content.FACTORY_RESET_WARNING)}
                </p>
              </Col>
              <Col xs={3}>
                <button
                  className="fb-button red"
                  type="button"
                  onClick={factoryReset}>
                  {t("FACTORY RESET")}
                </button>
              </Col>
            </Row>
            <CameraSelection
              env={this.props.bot.hardware.user_env} />
            <BoardType
              firmwareVersion={this.props.bot.hardware
                .informational_settings.firmware_version} />
          </MustBeOnline>
        </WidgetBody>
      </form>
    </Widget>;
  }
}
