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
import { MoveProps, EncoderDisplay } from "./interfaces";
import { Xyz } from "../devices/interfaces";
import { Popover, Position } from "@blueprintjs/core";
import { AxisDisplayGroup } from "./axis_display_group";
import { Session } from "../session";
import { INVERSION_MAPPING, ENCODER_MAPPING } from "../devices/reducer";
import { minFwVersionCheck, validBotLocationData } from "../util";
import { toggleWebAppBool } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";

export class Move extends React.Component<MoveProps, {}> {

  toggle = (name: Xyz) => () => {
    Session.invertBool(INVERSION_MAPPING[name]);
  };

  toggle_encoder_data =
    (name: EncoderDisplay) => () => Session.invertBool(ENCODER_MAPPING[name]);

  toggle_xy_swap = () =>
    this.props.dispatch(toggleWebAppBool(BooleanSetting.xy_swap));

  render() {
    const { location_data, informational_settings } = this.props.bot.hardware;
    const { firmware_version } = informational_settings;
    const { x_axis_inverted, y_axis_inverted, z_axis_inverted,
      raw_encoders, scaled_encoders, xySwap } = this.props;

    const btnColor = (flag: boolean) => { return flag ? "green" : "red"; };
    const xBtnColor = btnColor(x_axis_inverted);
    const yBtnColor = btnColor(y_axis_inverted);
    const zBtnColor = btnColor(z_axis_inverted);
    const rawBtnColor = btnColor(raw_encoders);
    const scaledBtnColor = btnColor(scaled_encoders);
    const xySwapBtnColor = btnColor(xySwap);

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
          <div>
            <label>
              {t("Invert Jog Buttons")}
            </label>
            <fieldset>
              <label>
                {t("X Axis")}
              </label>
              <button
                className={"fb-button fb-toggle-button " + xBtnColor}
                onClick={this.toggle("x")} />
            </fieldset>
            <fieldset>
              <label>
                {t("Y Axis")}
              </label>
              <button
                className={"fb-button fb-toggle-button " + yBtnColor}
                onClick={this.toggle("y")} />
            </fieldset>
            <fieldset>
              <label>
                {t("Z Axis")}
              </label>
              <button
                className={"fb-button fb-toggle-button " + zBtnColor}
                onClick={this.toggle("z")} />
            </fieldset>
            <label>
              {t("Display Encoder Data")}
            </label>
            <fieldset>
              <label>
                {t("Scaled encoder position")}
              </label>
              <button
                className={"fb-button fb-toggle-button " + scaledBtnColor}
                onClick={this.toggle_encoder_data("scaled_encoders")} />
            </fieldset>
            <fieldset>
              <label>
                {t("Raw encoder position")}
              </label>
              <button
                className={"fb-button fb-toggle-button " + rawBtnColor}
                onClick={this.toggle_encoder_data("raw_encoders")} />
            </fieldset>
            <label>
              {t("Swap jog buttons")}
            </label>
            <fieldset>
              <label>
                {t("x and y axis")}
              </label>
              <button
                className={"fb-button fb-toggle-button " + xySwapBtnColor}
                onClick={this.toggle_xy_swap} />
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
            xySwap={this.props.xySwap} />
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
