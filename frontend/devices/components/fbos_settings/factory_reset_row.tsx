import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { Content } from "../../../constants";
import { factoryReset, updateConfig } from "../../actions";
import { ToggleButton } from "../../../controls/toggle_button";
import { BotConfigInputBox } from "../bot_config_input_box";
import { FactoryResetRowProps } from "./interfaces";
import { ColWidth } from "../farmbot_os_settings";
import { t } from "../../../i18next_wrapper";

export function FactoryResetRow(props: FactoryResetRowProps) {
  const { dispatch, sourceFbosConfig, botOnline } = props;
  const disableFactoryReset = sourceFbosConfig("disable_factory_reset");
  const maybeDisableTimer = disableFactoryReset.value ? { color: "grey" } : {};
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
          onClick={factoryReset}
          disabled={!botOnline}>
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
          toggleValue={!disableFactoryReset.value}
          dim={!disableFactoryReset.consistent}
          toggleAction={() => {
            dispatch(updateConfig({
              disable_factory_reset: !disableFactoryReset.value
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
          disabled={!!disableFactoryReset.value}
          sourceFbosConfig={sourceFbosConfig} />
      </Col>
    </Row>
  </div>;
}
