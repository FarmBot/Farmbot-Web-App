import * as React from "react";
import { t } from "i18next";
import { Widget, WidgetBody, WidgetHeader } from "../../ui";
import { EStopButton } from "../../devices/components/e_stop_btn";
import { MustBeOnline } from "../../devices/must_be_online";
import { validBotLocationData } from "../../util";
import { toggleWebAppBool } from "../../config_storage/actions";
import { ToolTips } from "../../constants";
import {
  BooleanConfigKey as BooleanWebAppConfigKey
} from "../../config_storage/web_app_configs";
import { BooleanSetting } from "../../session_keys";
import { MoveProps } from "./interfaces";
import { MoveWidgetSettingsMenu } from "./settings_menu";
import { JogControlsGroup } from "./jog_controls_group";
import { BotPositionRows } from "./bot_position_rows";

export class Move extends React.Component<MoveProps, {}> {

  toggle = (key: BooleanWebAppConfigKey) => (): void =>
    this.props.dispatch(toggleWebAppBool(key));

  getValue = (key: BooleanWebAppConfigKey): boolean =>
    !!this.props.getWebAppConfigVal(BooleanSetting[key]);

  render() {
    const { location_data, informational_settings } = this.props.bot.hardware;
    const locationData = validBotLocationData(location_data);
    return <Widget>
      <WidgetHeader
        title={t("Move")}
        helpText={ToolTips.MOVE}>
        <MoveWidgetSettingsMenu
          toggle={this.toggle}
          getValue={this.getValue} />
        <EStopButton
          bot={this.props.bot}
          user={this.props.user} />
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
      </WidgetBody>
    </Widget>;
  }
}
