import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { Peripherals } from "./peripherals";
import { WebcamPanel } from "./webcam";
import { PinnedSequences } from "./pinned_sequence_list";
import { MoveControls } from "./move/move_controls";
import { DesignerControlsProps } from "./interfaces";
import { ControlsState } from "../interfaces";
import { Actions } from "../constants";
import { BotState, SourceFwConfig, UserEnv } from "../devices/interfaces";
import { AppState } from "../reducer";
import { GetWebAppConfigValue } from "../config_storage/actions";
import {
  FirmwareHardware, McuParams, TaggedLog, TaggedPeripheral, TaggedSequence,
  TaggedWebcamFeed,
} from "farmbot";
import { ResourceIndex } from "../resources/interfaces";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";
import { RunButtonMenuOpen } from "../sequences/interfaces";
import { Navigate } from "react-router";
import { mapStateToProps } from "./state_to_props";

export const RawDesignerControls = (props: DesignerControlsProps) => {
  React.useEffect(() => {
    props.dispatch({ type: Actions.OPEN_POPUP, payload: "controls" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <DesignerPanel panelName={"controls"} panel={Panel.Controls}>
    <DesignerPanelContent panelName={"controls"}>
      <Navigate to={Path.plants()} />
      <p>Controls have moved to the navigation bar.</p>
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const DesignerControls = connect(mapStateToProps)(RawDesignerControls);
// eslint-disable-next-line import/no-default-export
export default DesignerControls;

export interface ControlsPanelProps {
  dispatch: Function;
  appState: AppState;
  bot: BotState;
  getConfigValue: GetWebAppConfigValue;
  sourceFwConfig: SourceFwConfig;
  env: UserEnv;
  firmwareHardware: FirmwareHardware | undefined;
  logs: TaggedLog[];
  feeds: TaggedWebcamFeed[];
  peripherals: TaggedPeripheral[];
  sequences: TaggedSequence[];
  resources: ResourceIndex;
  menuOpen: RunButtonMenuOpen;
  firmwareSettings: McuParams;
}

export class ControlsPanel extends React.Component<ControlsPanelProps> {

  setPanelState = (key: keyof ControlsState) => () =>
    this.props.dispatch({
      type: Actions.SET_CONTROLS_PANEL_OPTION,
      payload: key,
    });

  Move = () => {
    return <div className={"move-tab"}>
      <MoveControls
        bot={this.props.bot}
        getConfigValue={this.props.getConfigValue}
        sourceFwConfig={this.props.sourceFwConfig}
        env={this.props.env}
        logs={this.props.logs}
        firmwareSettings={this.props.firmwareSettings}
        firmwareHardware={this.props.firmwareHardware}
        movementState={this.props.appState.movement}
        dispatch={this.props.dispatch} />
    </div>;
  };

  Peripherals = () => {
    return <div className={"peripherals-tab grid"}>
      <Peripherals
        getConfigValue={this.props.getConfigValue}
        firmwareHardware={this.props.firmwareHardware}
        bot={this.props.bot}
        peripherals={this.props.peripherals}
        resources={this.props.resources}
        dispatch={this.props.dispatch} />
      <PinnedSequences
        sequences={this.props.sequences}
        resources={this.props.resources}
        menuOpen={this.props.menuOpen}
        syncStatus={this.props.bot.hardware.informational_settings.sync_status}
        dispatch={this.props.dispatch} />
    </div>;
  };

  Webcams = () => {
    return <div className={"webcams-tab"}>
      <WebcamPanel
        feeds={this.props.feeds}
        dispatch={this.props.dispatch} />
    </div>;
  };

  render() {
    const { move, peripherals, webcams } = this.props.appState.controls;
    return <div className={"controls-content"}>
      <div className={"tabs"}>
        <label className={move ? "selected" : ""}
          onClick={this.setPanelState("move")}>{t("move")}</label>
        <label className={peripherals ? "selected" : ""}
          onClick={this.setPanelState("peripherals")}>{t("peripherals")}</label>
        <label className={webcams ? "selected" : ""}
          onClick={this.setPanelState("webcams")}>{t("webcams")}</label>
      </div>
      {move && <this.Move />}
      {peripherals && <this.Peripherals />}
      {webcams && <this.Webcams />}
    </div>;
  }
}
