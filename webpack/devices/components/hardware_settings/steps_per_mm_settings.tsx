import { BotConfigInputBox } from "../bot_config_input_box";
import { MotorsProps } from "../interfaces";
import { minFwVersionCheck } from "../../../util";

export function StepsPerMmSettings(props: MotorsProps) {
  const { dispatch, bot, sourceFbosConfig } = props;
  const { firmware_version } = bot.hardware.informational_settings;
  if (minFwVersionCheck(firmware_version, "5.0.5")) {
    return <NumericMCUInputGroup
      name={t("Steps per MM")}
      tooltip={ToolTips.STEPS_PER_MM}
      x={"movement_step_per_mm_x"}
      y={"movement_step_per_mm_y"}
      z={"movement_step_per_mm_z"}
      bot={bot}
      dispatch={dispatch} />;
  } else {
    return <Row>
      <Col xs={6}>
        <label>
          {t("Steps per MM")}
        </label>
        <SpacePanelToolTip tooltip={ToolTips.STEPS_PER_MM} />
      </Col>
      <Col xs={2}>
        <BotConfigInputBox
          setting="steps_per_mm_x"
          sourceFbosConfig={sourceFbosConfig}
          dispatch={dispatch} />
      </Col>
      <Col xs={2}>
        <BotConfigInputBox
          setting="steps_per_mm_y"
          sourceFbosConfig={sourceFbosConfig}
          dispatch={dispatch} />
      </Col>
      <Col xs={2}>
        <BotConfigInputBox
          setting="steps_per_mm_z"
          sourceFbosConfig={sourceFbosConfig}
          dispatch={dispatch} />
      </Col>
    </Row>;
  }
}
