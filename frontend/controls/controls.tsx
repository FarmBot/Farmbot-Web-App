import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import { BooleanSetting } from "../session_keys";
import { Peripherals } from "./peripherals";
import { WebcamPanel } from "./webcam";
import { PinnedSequences } from "./pinned_sequence_list";
import { MoveControls } from "./move/move_controls";
import { DesignerControlsProps } from "./interfaces";
import { mapStateToProps } from "./state_to_props";

export class RawDesignerControls
  extends React.Component<DesignerControlsProps, {}> {
  render() {
    return <DesignerPanel panelName={"controls"} panel={Panel.Controls}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"controls"}>
        <MoveControls
          bot={this.props.bot}
          getConfigValue={this.props.getConfigValue}
          sourceFwConfig={this.props.sourceFwConfig}
          env={this.props.env}
          logs={this.props.logs}
          firmwareSettings={this.props.firmwareSettings}
          firmwareHardware={this.props.firmwareHardware}
          movementState={this.props.movementState}
          dispatch={this.props.dispatch} />
        <hr />
        <Peripherals
          firmwareHardware={this.props.firmwareHardware}
          bot={this.props.bot}
          peripherals={this.props.peripherals}
          resources={this.props.resources}
          dispatch={this.props.dispatch} />
        <hr />
        <PinnedSequences
          sequences={this.props.sequences}
          resources={this.props.resources}
          menuOpen={this.props.menuOpen}
          syncStatus={this.props.bot.hardware.informational_settings.sync_status}
          dispatch={this.props.dispatch} />
        {!this.props.getConfigValue(BooleanSetting.hide_webcam_widget) &&
          <WebcamPanel
            feeds={this.props.feeds}
            dispatch={this.props.dispatch} />}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerControls = connect(mapStateToProps)(RawDesignerControls);
