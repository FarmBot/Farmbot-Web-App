import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { Content } from "../../../constants";
import { factoryReset, updateConfig } from "../../actions";
import { ToggleButton } from "../../../controls/toggle_button";
import { BotConfigInputBox } from "../bot_config_input_box";
import { FactoryResetRowProps } from "./interfaces";
import { ColWidth } from "../farmbot_os_settings";

export function FactoryResetRow(props: FactoryResetRowProps) {
  const { dispatch, sourceFbosConfig } = props;
  const diableFactoryReset = sourceFbosConfig("disable_factory_reset");
  const maybeDisableTimer = diableFactoryReset.value ? { color: "grey" } : {};
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
        <ToggleButton
          toggleValue={diableFactoryReset.value}
          dim={!diableFactoryReset.consistent}
          toggleAction={() => {
            dispatch(updateConfig({
              disable_factory_reset: !diableFactoryReset.value
            }));
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
          dispatch={dispatch}
          disabled={!!diableFactoryReset.value}
          sourceFbosConfig={sourceFbosConfig} />
      </Col>
    </Row >
  </div >;
}
