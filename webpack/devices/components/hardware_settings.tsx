import * as React from "react";
import { MCUFactoryReset, bulkToggleControlPanel } from "../actions";
import { Widget, WidgetHeader, WidgetBody } from "../../ui/index";
import { HardwareSettingsProps } from "../interfaces";
import { MustBeOnline } from "../must_be_online";
import { SaveBtn } from "../../ui/save_button";
import { ToolTips } from "../../constants";
import { DangerZone } from "./hardware_settings/danger_zone";
import { EncodersAndEndStops } from "./hardware_settings/encoders_and_endstops";
import { Motors } from "./hardware_settings/motors";
import { SpacePanelHeader } from "./hardware_settings/space_panel_header";
import {
  HomingAndCalibration
} from "./hardware_settings/homing_and_calibration";
import { SpecialStatus } from "../../resources/tagged_resources";

export class HardwareSettings extends
  React.Component<HardwareSettingsProps, {}> {

  render() {
    const { bot, dispatch } = this.props;

    return (
      <Widget className="hardware-widget">
        <WidgetHeader title="Hardware" helpText={ToolTips.HW_SETTINGS}>
          <MustBeOnline
            hideBanner={true}
            status={bot.hardware.informational_settings.sync_status}
            lockOpen={process.env.NODE_ENV !== "production"}>
            <SaveBtn
              status={bot.isUpdating ? SpecialStatus.SAVING : SpecialStatus.SAVED}
              dirtyText={" "}
              savingText={"Updating..."}
              savedText={"saved"}
              hidden={false} />
          </MustBeOnline>
        </WidgetHeader>
        <WidgetBody>
          <button
            className={"fb-button gray no-float"}
            onClick={() => dispatch(bulkToggleControlPanel(true))}>
            Expand All
          </button>
          <button
            className={"fb-button gray no-float"}
            onClick={() => dispatch(bulkToggleControlPanel(false))}>
            Collapse All
          </button>
          <MustBeOnline
            status={bot.hardware.informational_settings.sync_status}
            lockOpen={process.env.NODE_ENV !== "production"}>
            <div className="label-headings">
              <SpacePanelHeader />
            </div>
            <HomingAndCalibration
              dispatch={dispatch}
              bot={bot} />
            <Motors
              dispatch={dispatch}
              bot={bot} />
            <EncodersAndEndStops
              dispatch={dispatch}
              bot={bot} />
            <DangerZone
              dispatch={dispatch}
              bot={bot}
              onReset={MCUFactoryReset} />
          </MustBeOnline>
        </WidgetBody>
      </Widget>
    );
  }
}
