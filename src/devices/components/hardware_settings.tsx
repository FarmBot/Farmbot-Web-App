import * as React from "react";
import { t } from "i18next";
import { MCUFactoryReset } from "../actions";
import { Widget, WidgetHeader, WidgetBody } from "../../ui/index";
import { HardwareSettingsProps } from "../interfaces";
import { MustBeOnline } from "../must_be_online";
import { SaveBtn } from "../../ui/save_button";
import { ToolTips } from "../../constants";
import { DangerZone } from "./hardware_settings/danger_zone";
import { EncodersAndEndStops } from "./hardware_settings/encoders_and_endstops";
import { Motors } from "./hardware_settings/motors";
import { HomingAndCalibration } from "./hardware_settings/homing_and_calibration";
import { SpacePanelHeader } from "./hardware_settings/space_panel_header";

export class HardwareSettings extends
  React.Component<HardwareSettingsProps, {}> {

  render() {
    let { bot, dispatch } = this.props;

    return <Widget className="hardware-widget">
      <WidgetHeader title="Hardware" helpText={ToolTips.HW_SETTINGS}>
        <MustBeOnline
          status={bot.hardware.informational_settings.sync_status}
          lockOpen={process.env.NODE_ENV !== "production"}>
          <SaveBtn
            isDirty={false}
            isSaving={bot.isUpdating}
            isSaved={!bot.isUpdating}
            dirtyText={" "}
            savingText={"Updating..."}
            savedText={"saved"}
            hidden={false}
          />
        </MustBeOnline>
      </WidgetHeader>
      <WidgetBody>
        <MustBeOnline
          fallback="Device is offline."
          status={bot.hardware.informational_settings.sync_status}
          lockOpen={process.env.NODE_ENV !== "production"}>
          <div className="label-headings">
            <SpacePanelHeader>
              {t("Advanced")}
            </SpacePanelHeader>
          </div>
          <HomingAndCalibration
            dispatch={dispatch}
            bot={bot}
          />
          <Motors
            dispatch={dispatch}
            bot={bot}
          />
          <EncodersAndEndStops
            dispatch={dispatch}
            bot={bot}
          />
          <DangerZone
            dispatch={dispatch}
            bot={bot}
            onReset={MCUFactoryReset}
          />
        </MustBeOnline>
      </WidgetBody>
    </Widget>;
  }
}
