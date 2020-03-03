import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { Content, DeviceSetting } from "../../../constants";
import { factoryReset, updateConfig } from "../../actions";
import { ToggleButton } from "../../../controls/toggle_button";
import { BotConfigInputBox } from "../bot_config_input_box";
import { FactoryResetRowsProps } from "./interfaces";
import { ColWidth } from "../farmbot_os_settings";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export function FactoryResetRows(props: FactoryResetRowsProps) {
  const { dispatch, sourceFbosConfig, botOnline } = props;
  const disableFactoryReset = sourceFbosConfig("disable_factory_reset");
  const maybeDisableTimer = disableFactoryReset.value ? { color: "grey" } : {};
  return <div className={"factory-reset-options"}>
    <Row>
      <Highlight settingName={DeviceSetting.factoryReset}>
        <Col xs={ColWidth.label}>
          <label>
            {t(DeviceSetting.factoryReset)}
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
            title={t("FACTORY RESET")}
            disabled={!botOnline}>
            {t("FACTORY RESET")}
          </button>
        </Col>
      </Highlight>
    </Row>
    <Row>
      <Highlight settingName={DeviceSetting.autoFactoryReset}>
        <Col xs={ColWidth.label}>
          <label>
            {t(DeviceSetting.autoFactoryReset)}
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
      </Highlight>
    </Row>
    <Row>
      <Highlight settingName={DeviceSetting.connectionAttemptPeriod}>
        <Col xs={ColWidth.label}>
          <label style={maybeDisableTimer}>
            {t(DeviceSetting.connectionAttemptPeriod)}
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
      </Highlight>
    </Row>
  </div>;
}
