import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { Content } from "../../../constants";
import { factoryReset, updateConfig } from "../../actions";
import { ToggleButton } from "../../../controls/toggle_button";
import { noop } from "lodash";
import { BotConfigInputBox } from "../step_per_mm_box";
import { PowerAndResetProps } from "./power_and_reset";
import { ColWidth } from "../farmbot_os_settings";

export function FactoryResetRow(props: PowerAndResetProps) {
  const { disable_factory_reset } = props.bot.hardware.configuration;
  const maybeDisableTimer = disable_factory_reset ? { color: "grey" } : {};
  return <div>
    <Row>
      <Col xs={ColWidth.label}>
        <label>
          {t("Factory Reset")}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <p>
          {t(Content.FACTORY_RESET_WARNING)}
        </p>
      </Col>
      <Col xs={ColWidth.button}>
        <button
          className="fb-button red"
          type="button"
          onClick={factoryReset}>
          {t("FACTORY RESET")}
        </button>
      </Col>
    </Row>
    <Row>
      <Col xs={ColWidth.label}>
        <label>
          {t("Automatic Factory Reset")}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <p>
          {t(Content.AUTO_FACTORY_RESET)}
        </p>
      </Col>
      <Col xs={ColWidth.button}>
        <ToggleButton toggleValue={!disable_factory_reset}
          toggleAction={() => {
            updateConfig({
              disable_factory_reset: !disable_factory_reset
            })(noop);
          }} />
      </Col>
    </Row>
    <Row>
      <Col xs={ColWidth.label}>
        <label style={maybeDisableTimer}>
          {t("Connection Attempt Period")}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <p style={maybeDisableTimer}>
          {t(Content.AUTO_FACTORY_RESET_PERIOD)}
        </p>
      </Col>
      <Col xs={ColWidth.button}>
        <BotConfigInputBox
          setting="network_not_found_timer"
          bot={props.bot}
          dispatch={props.dispatch}
          disabled={disable_factory_reset} />
      </Col>
    </Row >
  </div >;
}
