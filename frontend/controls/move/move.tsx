import * as React from "react";
import { t } from "i18next";
import { Widget, WidgetBody, WidgetHeader } from "../../ui";
import { EStopButton } from "../../devices/components/e_stop_btn";
import { MustBeOnline } from "../../devices/must_be_online";
import { validBotLocationData } from "../../util";
import { toggleWebAppBool } from "../../config_storage/actions";
import { ToolTips } from "../../constants";
import { BooleanSetting } from "../../session_keys";
import { MoveProps } from "./interfaces";
import { MoveWidgetSettingsMenu } from "./settings_menu";
import { JogControlsGroup } from "./jog_controls_group";
import { BotPositionRows } from "./bot_position_rows";
import { MotorPositionPlot } from "./motor_position_plot";
import { Popover, Position } from "@blueprintjs/core";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";

export class Move extends React.Component<MoveProps, {}> {

  toggle = (key: BooleanConfigKey) => (): void =>
    this.props.dispatch(toggleWebAppBool(key));

  getValue = (key: BooleanConfigKey): boolean =>
    !!this.props.getWebAppConfigVal(BooleanSetting[key]);

  render() {
    const { location_data, informational_settings } = this.props.bot.hardware;
    const locationData = validBotLocationData(location_data);
    return <Widget className="move-widget">
      <WidgetHeader
        title={t("Move")}
        helpText={ToolTips.MOVE}>
        <Popover position={Position.BOTTOM_RIGHT}>
          <i className="fa fa-gear" />
          <MoveWidgetSettingsMenu
            toggle={this.toggle}
            getValue={this.getValue} />
        </Popover>
        <EStopButton bot={this.props.bot} />
      </WidgetHeader>
      <WidgetBody>
        <MustBeOnline
          lockOpen={process.env.NODE_ENV !== "production"}
          networkState={this.props.botToMqttStatus}
          syncStatus={informational_settings.sync_status}>
          <JogControlsGroup
            dispatch={this.props.dispatch}
            stepSize={this.props.bot.stepSize}
            botPosition={locationData.position}
            getValue={this.getValue}
            arduinoBusy={this.props.arduinoBusy}
            firmwareSettings={this.props.firmwareSettings} />
          <BotPositionRows
            locationData={locationData}
            getValue={this.getValue}
            arduinoBusy={this.props.arduinoBusy}
            firmware_version={informational_settings.firmware_version} />
        </MustBeOnline>
        {this.props.getWebAppConfigVal(BooleanSetting.show_motor_plot) &&
          <MotorPositionPlot locationData={locationData} />}
      </WidgetBody>
    </Widget>;
  }
}
