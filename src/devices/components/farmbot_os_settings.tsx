import * as React from "react";
import { t } from "i18next";
import { info, error, success } from "farmbot-toastr";
import { FarmbotOsProps, FarmbotOsState } from "../interfaces";
import {
  changeDevice,
  saveAccountChanges,
  reboot,
  powerOff,
  factoryReset
} from "../actions";
import { OsUpdateButton } from "./os_update_button";
import { devices } from "../../device";
import {
  DeprecatedFBSelect,
  DropDownItem,
  Widget,
  WidgetHeader,
  WidgetBody,
  Row,
  Col,
  SaveBtn
} from "../../ui/index";
import { save } from "../../api/crud";
import { MustBeOnline } from "../must_be_online";
import { ToolTips, Content } from "../../constants";
import { TimezoneSelector } from "../timezones/timezone_selector";
import { timezoneMismatch } from "../timezones/guess_timezone";

const CAMERA_CHOICES = [
  { label: "USB Camera", value: "USB" },
  { label: "Raspberry Pi Camera", value: "RPI" }
];

export class FarmbotOsSettings
  extends React.Component<FarmbotOsProps, FarmbotOsState> {

  changeBot = (e: React.MouseEvent<HTMLInputElement>) => {
    let { account, dispatch } = this.props;
    dispatch(changeDevice(account, { name: e.currentTarget.value }));
  }

  saveBot(e: React.MouseEvent<{}>) {
    e.preventDefault();
    this.props.dispatch(save(this.props.account.uuid));
  }

  updateBot = (e: React.MouseEvent<{}>) => {
    this.props.dispatch(saveAccountChanges);
  }

  sendOffConfig = (e: DropDownItem) => {
    let message = { "camera": JSON.stringify(e.value) };
    info(t("Sending camera configuration..."), t("Sending"))
    devices
      .current
      .setUserEnv(message)
      .then(() => success(t("Successfully configured camera!")))
      .catch(() => error(t("An error occurred during configuration.")));
  }

  handleTimezone = (timezone: string) => {
    let { account, dispatch } = this.props;
    dispatch(changeDevice(account, { timezone }));
    dispatch(save(account.uuid));
  }

  maybeWarnTz = () => {
    let wrongTZ = timezoneMismatch(this.props.account.body.timezone);
    if (wrongTZ) {
      return `Note: The selected timezone for your FarmBot is different than
        your local browser time.`;
    } else {
      return ""
    }
  }

  render() {
    let { account } = this.props;
    let isSaving = account && account.saving;
    let isDirty = account && account.dirty;
    let isSaved = !isSaving && !isDirty;

    return <Widget className="device-widget">
      <form onSubmit={this.saveBot.bind(this)}>
        <WidgetHeader title="Device" helpText={ToolTips.OS_SETTINGS}>
          <SaveBtn
            isDirty={isDirty}
            isSaving={isSaving}
            isSaved={isSaved}
            onClick={this.updateBot}
          />
        </WidgetHeader>
        <WidgetBody>
          <Row>
            <Col xs={2}>
              <label>
                {t("NAME")}
              </label>
            </Col>
            <Col xs={10}>
              <input
                name="name"
                onChange={this.changeBot}
                value={this.props.account.body.name} />
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
                {`mqtt://${this.props.auth.token.unencoded.mqtt}`}
              </p>
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
                  onUpdate={this.handleTimezone}
                />
              </div>
            </Col>
          </Row>
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
                  {t("Version")}
                  {this
                    .props
                    .bot
                    .hardware
                    .informational_settings.controller_version
                    || t(" unknown (offline)")}
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
                  {t(`This will restart FarmBot's Raspberry
                    Pi and controller software.`)}
                </p>
              </Col>
              <Col xs={3}>
                <button
                  className="fb-button yellow"
                  type="button"
                  onClick={reboot}
                >
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
                  {t(`This will shutdown FarmBot's Raspberry Pi. To turn it
                    back on, unplug FarmBot and plug it back in.`)}
                </p>
              </Col>
              <Col xs={3}>
                <button
                  className="fb-button red"
                  type="button"
                  onClick={powerOff}
                >
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
                  onClick={factoryReset}
                >
                  {t("FACTORY RESET")}
                </button>
              </Col>
            </Row>
            <Row>
              <Col xs={2}>
                <label>
                  {t("CAMERA")}
                </label>
              </Col>
              <Col xs={7}>
                <div>
                  <DeprecatedFBSelect
                    allowEmpty={true}
                    list={CAMERA_CHOICES}
                    placeholder="Select a camera..."
                    onChange={this.sendOffConfig} />
                </div>
              </Col>
            </Row>
          </MustBeOnline>
        </WidgetBody>
      </form>
    </Widget>;
  }
}
