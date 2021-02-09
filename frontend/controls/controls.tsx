import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import { MustBeOnline, isBotOnlineFromState } from "../devices/must_be_online";
import { getStatus } from "../connectivity/reducer_support";
import { JogControlsGroup } from "./move/jog_controls_group";
import { BotPositionRows } from "./move/bot_position_rows";
import { BooleanSetting } from "../session_keys";
import { MotorPositionPlot } from "./move/motor_position_plot";
import { BotState, ShouldDisplay, UserEnv } from "../devices/interfaces";
import {
  TaggedWebcamFeed, TaggedPeripheral, McuParams, FirmwareHardware, TaggedSequence,
} from "farmbot";
import {
  GetWebAppConfigValue, getWebAppConfigValue, toggleWebAppBool,
} from "../config_storage/actions";
import { Everything } from "../interfaces";
import { validFwConfig, validFbosConfig, validBotLocationData } from "../util";
import { getFirmwareConfig, getFbosConfig } from "../resources/getters";
import { getEnv, getShouldDisplayFn } from "../farmware/state_to_props";
import { sourceFbosConfigValue } from "../settings/source_config_value";
import { isFwHardwareValue } from "../settings/firmware/firmware_hardware_support";
import {
  selectAllWebcamFeeds, selectAllPeripherals, selectAllSequences,
} from "../resources/selectors";
import { uniq } from "lodash";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { Peripherals } from "./peripherals";
import { WebcamPanel } from "./webcam";
import { Popover, Position } from "@blueprintjs/core";
import { MoveWidgetSettingsMenu } from "./move/settings_menu";
import { ToolTips } from "../constants";
import { Col, Row, Widget, WidgetBody, WidgetHeader } from "../ui";
import { t } from "../i18next_wrapper";
import { TestButton } from "../sequences/test_button";
import { ResourceIndex } from "../resources/interfaces";

export interface DesignerControlsProps {
  dispatch: Function;
  bot: BotState;
  feeds: TaggedWebcamFeed[];
  peripherals: TaggedPeripheral[];
  sequences: TaggedSequence[];
  resources: ResourceIndex;
  menuOpen: boolean;
  firmwareSettings: McuParams;
  getWebAppConfigVal: GetWebAppConfigValue;
  env: UserEnv;
  firmwareHardware: FirmwareHardware | undefined;
  shouldDisplay: ShouldDisplay;
}

export const mapStateToProps = (props: Everything): DesignerControlsProps => {
  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;

  const env = getEnv(props.resources.index);

  const { configuration } = props.bot.hardware;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const sourceFbosConfig = sourceFbosConfigValue(fbosConfig, configuration);
  const { value } = sourceFbosConfig("firmware_hardware");
  const firmwareHardware = isFwHardwareValue(value) ? value : undefined;

  return {
    feeds: selectAllWebcamFeeds(props.resources.index),
    dispatch: props.dispatch,
    bot: props.bot,
    peripherals: uniq(selectAllPeripherals(props.resources.index)),
    sequences: selectAllSequences(props.resources.index),
    resources: props.resources.index,
    menuOpen: props.resources.consumers.sequences.menuOpen,
    firmwareSettings: fwConfig || mcu_params,
    getWebAppConfigVal: getWebAppConfigValue(() => props),
    env,
    firmwareHardware,
    shouldDisplay: getShouldDisplayFn(props.resources.index, props.bot),
  };
};

export class RawDesignerControls
  extends React.Component<DesignerControlsProps, {}> {
  get arduinoBusy() {
    return !!this.props.bot.hardware.informational_settings.busy;
  }

  get botOnline() {
    return isBotOnlineFromState(this.props.bot);
  }

  getValue = (key: BooleanConfigKey): boolean =>
    !!this.props.getWebAppConfigVal(BooleanSetting[key]);

  toggle = (key: BooleanConfigKey) => (): void =>
    this.props.dispatch(toggleWebAppBool(key));

  render() {
    const { bot } = this.props;
    const { location_data, informational_settings } = bot.hardware;
    const locationData = validBotLocationData(location_data);
    const pinnedSequences = this.props.sequences.filter(x => x.body.pinned);
    return <DesignerPanel panelName={"controls"} panel={Panel.Controls}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"controls"}>
        <div className={"move"}>
          <Popover position={Position.LEFT_TOP} className={"move-settings"}>
            <i className="fa fa-gear" />
            <MoveWidgetSettingsMenu
              toggle={this.toggle}
              getValue={this.getValue}
              firmwareHardware={this.props.firmwareHardware} />
          </Popover>
          <MustBeOnline
            lockOpen={process.env.NODE_ENV !== "production"}
            networkState={getStatus(bot.connectivity.uptime["bot.mqtt"])}
            syncStatus={informational_settings.sync_status}>
            <JogControlsGroup
              dispatch={this.props.dispatch}
              stepSize={bot.stepSize}
              botPosition={locationData.position}
              getConfigValue={this.getValue}
              arduinoBusy={this.arduinoBusy}
              botOnline={true} // covered by MustBeOnline
              env={this.props.env}
              firmwareSettings={this.props.firmwareSettings} />
            <BotPositionRows
              locationData={locationData}
              getValue={this.getValue}
              arduinoBusy={this.arduinoBusy}
              botOnline={this.botOnline}
              shouldDisplay={this.props.shouldDisplay}
              firmwareSettings={this.props.firmwareSettings}
              firmwareHardware={this.props.firmwareHardware} />
          </MustBeOnline>
          {this.props.getWebAppConfigVal(BooleanSetting.show_motor_plot) &&
            <MotorPositionPlot locationData={locationData} />}
        </div>
        <hr />
        <Peripherals
          firmwareHardware={this.props.firmwareHardware}
          bot={this.props.bot}
          peripherals={this.props.peripherals}
          dispatch={this.props.dispatch}
          disabled={this.arduinoBusy || !this.botOnline} />
        <hr />
        {pinnedSequences.length > 0 &&
          <Widget className={"pinned-sequences-widget"}>
            <WidgetHeader
              title={t("Pinned Sequences")}
              helpText={ToolTips.PINNED_SEQUENCES} />
            <WidgetBody>
              {pinnedSequences.map(sequence =>
                <Row key={sequence.uuid}>
                  <Col xs={8}>
                    <label style={{ marginTop: 0, verticalAlign: "top" }}>
                      {sequence.body.name}
                    </label>
                  </Col>
                  <Col xs={4}>
                    <TestButton
                      syncStatus={bot.hardware.informational_settings.sync_status}
                      sequence={sequence}
                      resources={this.props.resources}
                      menuOpen={this.props.menuOpen}
                      dispatch={this.props.dispatch} />
                  </Col>
                </Row>)}
            </WidgetBody>
          </Widget>}
        {pinnedSequences.length > 0 && <hr />}
        {!this.props.getWebAppConfigVal(BooleanSetting.hide_webcam_widget) &&
          <WebcamPanel
            feeds={this.props.feeds}
            dispatch={this.props.dispatch} />}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerControls = connect(mapStateToProps)(RawDesignerControls);
