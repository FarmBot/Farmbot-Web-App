import * as React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import { changeStepSize, moveAbs } from "../devices/actions";
import { Peripherals } from "./peripherals";
import { EStopButton } from "../devices/components/e_stop_btn";
import { JogButtons } from "./jog_buttons";
import { AxisInputBoxGroup } from "./axis_input_box_group";
import { Row, Page, Col, Widget, WidgetBody, WidgetHeader } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { StepSizeSelector } from "./step_size_selector";
import { MustBeOnline } from "../devices/must_be_online";
import { ToolTips } from "../constants";
import { WebcamPanel } from "./webcam_panel";
import { Props } from "./interfaces";
import { Xyz } from "../devices/interfaces";
import { Popover, Position } from "@blueprintjs/core";

@connect(mapStateToProps)
export class Controls extends React.Component<Props, {}> {

  toggle = (name: Xyz) => () =>
    this.props.dispatch({ type: "INVERT_JOG_BUTTON", payload: name });

  render() {
    let { sync_status } = this.props.bot.hardware.informational_settings;
    let { x_axis_inverted, y_axis_inverted, z_axis_inverted } = this.props.bot;
    let xBtnColor = x_axis_inverted ? "green" : "red";
    let yBtnColor = y_axis_inverted ? "green" : "red";
    let zBtnColor = z_axis_inverted ? "green" : "red";

    return <Page className="controls">
      <Row>
        <Col xs={12} sm={6} md={4} mdOffset={1}>
          <Widget>
            <WidgetHeader
              title="Move"
              helpText={ToolTips.MOVE}>
              <Popover position={Position.BOTTOM}>
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
                      onClick={this.toggle("x")}
                    />
                  </fieldset>
                  <fieldset>
                    <label>
                      {t("Y Axis")}
                    </label>
                    <button
                      className={"fb-button fb-toggle-button " + yBtnColor}
                      onClick={this.toggle("y")}
                    />
                  </fieldset>
                  <fieldset>
                    <label>
                      {t("Z Axis")}
                    </label>
                    <button
                      className={"fb-button fb-toggle-button " + zBtnColor}
                      onClick={this.toggle("z")}
                    />
                  </fieldset>
                </div>
              </Popover>
              <EStopButton
                bot={this.props.bot}
                user={this.props.user}
              />
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
                  selected={this.props.bot.stepSize}
                />
                <JogButtons
                  bot={this.props.bot}
                  x_axis_inverted={x_axis_inverted}
                  y_axis_inverted={y_axis_inverted}
                  z_axis_inverted={z_axis_inverted}
                />
                <AxisInputBoxGroup
                  bot={this.props.bot}
                  onCommit={input => moveAbs(input)}
                />
              </MustBeOnline>
            </WidgetBody>
          </Widget>
          <Peripherals
            bot={this.props.bot}
            peripherals={this.props.peripherals}
            dispatch={this.props.dispatch}
            resources={this.props.resources}
          />
        </Col>
        <Col xs={12} sm={6}>
          <WebcamPanel {...this.props} />
        </Col>
      </Row>
    </Page>;
  }
};
