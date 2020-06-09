import * as React from "react";
import { connect } from "react-redux";
import { DesignerPanel, DesignerPanelContent } from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { DesignerNavTabs, Panel } from "../panel_header";
import {
  bulkToggleControlPanel, MCUFactoryReset, toggleControlPanel,
} from "../../devices/actions";
import { FarmBotSettings, Firmware, PowerAndReset } from "./fbos_settings";
import {
  HomingAndCalibration, Motors, Encoders, EndStops, ErrorHandling,
  PinGuard, DangerZone, PinBindings, isFwHardwareValue,
} from "./hardware_settings";
import { DevSettings } from "../../account/dev/dev_support";
import { maybeOpenPanel } from "../../devices/components/maybe_highlight";
import { isBotOnlineFromState } from "../../devices/must_be_online";
import { DesignerSettingsProps } from "./interfaces";
import { Designer, PlainDesignerSettings } from "./farm_designer_settings";
import { SearchField } from "../../ui/search_field";
import { mapStateToProps } from "./state_to_props";
import { Actions } from "../../constants";

export class RawDesignerSettings
  extends React.Component<DesignerSettingsProps, {}> {

  componentDidMount = () =>
    this.props.dispatch(maybeOpenPanel(this.props.bot.controlPanelState, true));

  componentWillUnmount = () => {
    this.props.dispatch(bulkToggleControlPanel(false, true));
    this.props.dispatch(toggleControlPanel("farmbot_os"));
    this.props.dispatch({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: ""
    });
  }

  render() {
    const { getConfigValue, dispatch, firmwareConfig,
      sourceFwConfig, sourceFbosConfig, resources,
    } = this.props;
    const { controlPanelState } = this.props.bot;
    const settingsProps = { getConfigValue, dispatch };
    const commonProps = { dispatch, controlPanelState };
    const { value } = this.props.sourceFbosConfig("firmware_hardware");
    const firmwareHardware = isFwHardwareValue(value) ? value : undefined;
    const botOnline = isBotOnlineFromState(this.props.bot);
    const { busy } = this.props.bot.hardware.informational_settings;
    return <DesignerPanel panelName={"settings"} panel={Panel.Settings}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"settings"}>
        <SearchField
          placeholder={t("Search settings...")}
          searchTerm={this.props.searchTerm}
          onChange={searchTerm => {
            dispatch(bulkToggleControlPanel(true, true));
            dispatch({
              type: Actions.SET_SETTINGS_SEARCH_TERM,
              payload: searchTerm
            });
          }} />
        {DevSettings.futureFeaturesEnabled() ?
          <div className="all-settings">
            <div className="bulk-expand-controls">
              <button
                className={"fb-button gray no-float"}
                onClick={() => dispatch(bulkToggleControlPanel(true, true))}>
                {t("Expand All")}
              </button>
              <button
                className={"fb-button gray no-float"}
                onClick={() => dispatch(bulkToggleControlPanel(false, true))}>
                {t("Collapse All")}
              </button>
            </div>
            <div className="all-settings-content">
              <FarmBotSettings
                bot={this.props.bot}
                env={this.props.env}
                alerts={this.props.alerts}
                saveFarmwareEnv={this.props.saveFarmwareEnv}
                dispatch={this.props.dispatch}
                sourceFbosConfig={sourceFbosConfig}
                shouldDisplay={this.props.shouldDisplay}
                botOnline={botOnline}
                timeSettings={this.props.timeSettings}
                device={this.props.deviceAccount} />
              <Firmware
                bot={this.props.bot}
                alerts={this.props.alerts}
                dispatch={this.props.dispatch}
                sourceFbosConfig={sourceFbosConfig}
                shouldDisplay={this.props.shouldDisplay}
                botOnline={botOnline}
                timeSettings={this.props.timeSettings} />
              <PowerAndReset {...commonProps}
                sourceFbosConfig={sourceFbosConfig}
                botOnline={botOnline} />
              <HomingAndCalibration {...commonProps}
                bot={this.props.bot}
                sourceFwConfig={sourceFwConfig}
                shouldDisplay={this.props.shouldDisplay}
                firmwareConfig={firmwareConfig}
                firmwareHardware={firmwareHardware}
                botOnline={botOnline} />
              <Motors {...commonProps}
                arduinoBusy={busy}
                sourceFwConfig={sourceFwConfig}
                firmwareHardware={firmwareHardware} />
              <Encoders {...commonProps}
                arduinoBusy={busy}
                sourceFwConfig={sourceFwConfig}
                shouldDisplay={this.props.shouldDisplay}
                firmwareHardware={firmwareHardware} />
              <EndStops {...commonProps}
                arduinoBusy={busy}
                sourceFwConfig={sourceFwConfig} />
              <ErrorHandling {...commonProps}
                arduinoBusy={busy}
                sourceFwConfig={sourceFwConfig} />
              <PinBindings  {...commonProps}
                resources={resources}
                firmwareHardware={firmwareHardware} />
              <PinGuard {...commonProps}
                arduinoBusy={busy}
                resources={resources}
                sourceFwConfig={sourceFwConfig} />
              <DangerZone {...commonProps}
                arduinoBusy={busy}
                onReset={MCUFactoryReset}
                botOnline={botOnline} />
              <Designer {...commonProps}
                getConfigValue={getConfigValue} />
            </div>
          </div>
          : <div className="designer-settings">
            {PlainDesignerSettings(settingsProps)}
          </div>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSettings = connect(mapStateToProps)(RawDesignerSettings);
