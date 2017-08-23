import * as React from "react";
import { t } from "i18next";
import { changeStepSize, moveAbs } from "../devices/actions";
import { EStopButton } from "../devices/components/e_stop_btn";
import { JogButtons } from "./jog_buttons";
import { AxisInputBoxGroup } from "./axis_input_box_group";
import { Row, Col, Widget, WidgetBody, WidgetHeader } from "../ui";
import { StepSizeSelector } from "./step_size_selector";
import { MustBeOnline } from "../devices/must_be_online";
import { ToolTips } from "../constants";
import { MoveProps, EncoderDisplay } from "./interfaces";
import { Xyz, BotLocationData } from "../devices/interfaces";
import { Popover, Position } from "@blueprintjs/core";
import { AxisDisplayGroup } from "./axis_display_group";

export class Move extends React.Component<MoveProps, {}> {

  toggle = (name: Xyz) => () =>
    this.props.dispatch({ type: "INVERT_JOG_BUTTON", payload: name });

  toggle_encoder_data = (name: EncoderDisplay) => () =>
    this.props.dispatch({ type: "DISPLAY_ENCODER_DATA", payload: name });

  render() {
    let { sync_status } = this.props.bot.hardware.informational_settings;
    let { x_axis_inverted, y_axis_inverted, z_axis_inverted,
      raw_encoders, scaled_encoders } = this.props.bot;
    let xBtnColor = x_axis_inverted ? "green" : "red";
    let yBtnColor = y_axis_inverted ? "green" : "red";
    let zBtnColor = z_axis_inverted ? "green" : "red";
    let rawBtnColor = raw_encoders ? "green" : "red";
    let scaledBtnColor = scaled_encoders ? "green" : "red";
    let locationData: BotLocationData;
    if (this.props.bot.hardware.location_data) {
      locationData = this.props.bot.hardware.location_data;
    } else {
      locationData = {
        position: { x: undefined, y: undefined, z: undefined },
        raw_encoders: { x: undefined, y: undefined, z: undefined },
        scaled_encoders: { x: undefined, y: undefined, z: undefined },
      };
    }
    let motor_coordinates = locationData.position;
    let raw_encoders_data = locationData.raw_encoders;
    let scaled_encoders_data = locationData.scaled_encoders;

    return (
      <Widget>
        <WidgetHeader
          title="Move"
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
                  {t("Raw encoder position")}
                </label>
                <button
                  className={"fb-button fb-toggle-button " + rawBtnColor}
                  onClick={this.toggle_encoder_data("raw_encoders")} />
              </fieldset>
              <fieldset>
                <label>
                  {t("Scaled encoder position")}
                </label>
                <button
                  className={"fb-button fb-toggle-button " + scaledBtnColor}
                  onClick={this.toggle_encoder_data("scaled_encoders")} />
              </fieldset>
            </div>
          </Popover>
          <EStopButton
            bot={this.props.bot}
            user={this.props.user} />
        </WidgetHeader>
        <WidgetBody>
          <MustBeOnline
            fallback="Bot is offline."
            lockOpen={process.env.NODE_ENV !== "production"}
            status={sync_status}>
            <label className="text-center">
              {t("MOVE AMOUNT (mm)")}
            </label>
            <StepSizeSelector
              choices={[1, 10, 100, 1000, 10000]}
              selector={num => this.props.dispatch(changeStepSize(num))}
              selected={this.props.bot.stepSize} />
            <JogButtons
              bot={this.props.bot}
              x_axis_inverted={x_axis_inverted}
              y_axis_inverted={y_axis_inverted}
              z_axis_inverted={z_axis_inverted}
              disabled={this.props.disabled} />
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
              label={"Motor Coordinates (mm)"} />
            {scaled_encoders &&
              <AxisDisplayGroup
                position={scaled_encoders_data}
                label={"Scaled Encoder (steps)"} />}
            {raw_encoders &&
              <AxisDisplayGroup
                position={raw_encoders_data}
                label={"Raw Encoder data"} />}
            <AxisInputBoxGroup
              position={motor_coordinates}
              onCommit={input => moveAbs(input)}
              disabled={this.props.disabled} />
          </MustBeOnline>
        </WidgetBody>
      </Widget>
    );
  }
}
