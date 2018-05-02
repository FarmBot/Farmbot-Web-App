import * as React from "react";
import { t } from "i18next";
import { changeStepSize, moveAbs } from "../devices/actions";
import { EStopButton } from "../devices/components/e_stop_btn";
import { JogButtons } from "./jog_buttons";
import { AxisInputBoxGroup } from "./axis_input_box_group";
import { Row, Col, Widget, WidgetBody, WidgetHeader } from "../ui/index";
import { StepSizeSelector } from "./step_size_selector";
import { MustBeOnline } from "../devices/must_be_online";
import { ToolTips } from "../constants";
import { MoveProps } from "./interfaces";
import { Popover, Position } from "@blueprintjs/core";
import { AxisDisplayGroup } from "./axis_display_group";
import { minFwVersionCheck, validBotLocationData } from "../util";
import { toggleWebAppBool } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { ToggleButton } from "./toggle_button";
import {
  BooleanConfigKey as BooleanWebAppConfigKey
} from "../config_storage/web_app_configs";

export class Move extends React.Component<MoveProps, {}> {

  toggle = (key: BooleanWebAppConfigKey) => () => {
    this.props.dispatch(toggleWebAppBool(key));
  };

  render() {
    const { location_data, informational_settings } = this.props.bot.hardware;
    const { firmware_version } = informational_settings;
    const { getWebAppConfigVal } = this.props;

    const x_axis_inverted = !!getWebAppConfigVal(BooleanSetting.x_axis_inverted);
    const y_axis_inverted = !!getWebAppConfigVal(BooleanSetting.y_axis_inverted);
    const z_axis_inverted = !!getWebAppConfigVal(BooleanSetting.z_axis_inverted);
    const raw_encoders = !!getWebAppConfigVal(BooleanSetting.raw_encoders);
    const scaled_encoders = !!getWebAppConfigVal(BooleanSetting.scaled_encoders);
    const xySwap = !!getWebAppConfigVal(BooleanSetting.xy_swap);
    const doFindHome = !!getWebAppConfigVal(BooleanSetting.home_button_homing);

    const locationData = validBotLocationData(location_data);
    const motor_coordinates = locationData.position;
    const raw_encoders_data = locationData.raw_encoders;
    const scaled_encoders_data = locationData.scaled_encoders;

    const scaled_encoder_label =
      minFwVersionCheck(firmware_version, "5.0.5")
        ? t("Scaled Encoder (mm)")
        : t("Scaled Encoder (steps)");

    return <Widget>
      <WidgetHeader
        title={t("Move")}
        helpText={ToolTips.MOVE}>
        <Popover position={Position.BOTTOM_RIGHT}>
          <i className="fa fa-gear" />
          <div className="move-settings-menu">
            <p>
              {t("Invert Jog Buttons")}
            </p>
            <fieldset>
              <label>
                {t("X Axis")}
              </label>
              <ToggleButton
                toggleAction={this.toggle(BooleanSetting.x_axis_inverted)}
                toggleValue={x_axis_inverted} />
            </fieldset>
            <fieldset>
              <label>
                {t("Y Axis")}
              </label>
              <ToggleButton
                toggleAction={this.toggle(BooleanSetting.y_axis_inverted)}
                toggleValue={y_axis_inverted} />
            </fieldset>
            <fieldset>
              <label>
                {t("Z Axis")}
              </label>
              <ToggleButton
                toggleAction={this.toggle(BooleanSetting.z_axis_inverted)}
                toggleValue={z_axis_inverted} />
            </fieldset>

            <p>
              {t("Display Encoder Data")}
            </p>
            <fieldset>
              <label>
                {t("Scaled encoder position")}
              </label>
              <ToggleButton
                toggleAction={this.toggle(BooleanSetting.scaled_encoders)}
                toggleValue={scaled_encoders} />
            </fieldset>
            <fieldset>
              <label>
                {t("Raw encoder position")}
              </label>
              <ToggleButton
                toggleAction={this.toggle(BooleanSetting.raw_encoders)}
                toggleValue={raw_encoders} />
            </fieldset>

            <p>
              {t("Swap jog buttons (and rotate map)")}
            </p>
            <fieldset>
              <label>
                {t("x and y axis")}
              </label>
              <ToggleButton
                toggleAction={this.toggle(BooleanSetting.xy_swap)}
                toggleValue={xySwap} />
            </fieldset>

            <p>
              {t("Home button behavior")}
            </p>
            <fieldset>
              <label>
                {t("perform homing (find home)")}
              </label>
              <ToggleButton
                toggleAction={this.toggle(BooleanSetting.home_button_homing)}
                toggleValue={doFindHome} />
            </fieldset>
          </div>
        </Popover>
        <EStopButton
          bot={this.props.bot}
          user={this.props.user} />
      </WidgetHeader>
      <WidgetBody>
        <MustBeOnline
          lockOpen={process.env.NODE_ENV !== "production"}
          networkState={this.props.botToMqttStatus}
          syncStatus={this.props.bot.hardware.informational_settings.sync_status}>
          <label className="text-center">
            {t("MOVE AMOUNT (mm)")}
          </label>
          <StepSizeSelector
            choices={[1, 10, 100, 1000, 10000]}
            selector={num => this.props.dispatch(changeStepSize(num))}
            selected={this.props.bot.stepSize} />
          <JogButtons
            stepSize={this.props.bot.stepSize}
            botPosition={locationData.position}
            axisInversion={{
              x: x_axis_inverted,
              y: y_axis_inverted,
              z: z_axis_inverted
            }}
            arduinoBusy={this.props.arduinoBusy}
            firmwareSettings={this.props.firmwareSettings}
            xySwap={xySwap}
            doFindHome={doFindHome} />
          <Row>
            <Col xs={3}>
              <label>{t("X AXIS")}</label>
            </Col>
            <Col xs={3}>
              <label>{t("Y AXIS")}</label>
            </Col>
            <Col xs={3}>
              <label>{t("Z AXIS")}</label>
            </Col>
          </Row>
          <AxisDisplayGroup
            position={motor_coordinates}
            label={t("Motor Coordinates (mm)")} />
          {scaled_encoders &&
            <AxisDisplayGroup
              position={scaled_encoders_data}
              label={scaled_encoder_label} />}
          {raw_encoders &&
            <AxisDisplayGroup
              position={raw_encoders_data}
              label={t("Raw Encoder data")} />}
          <AxisInputBoxGroup
            position={motor_coordinates}
            onCommit={input => moveAbs(input)}
            disabled={this.props.arduinoBusy} />
        </MustBeOnline>
      </WidgetBody>
    </Widget>;
  }
}
