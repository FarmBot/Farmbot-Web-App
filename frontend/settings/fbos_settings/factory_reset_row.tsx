import * as React from "react";
import { Row, Col } from "../../ui/index";
import { Content, DeviceSetting } from "../../constants";
import { factoryReset, updateConfig } from "../../devices/actions";
import { ToggleButton } from "../../controls/toggle_button";
import { BotConfigInputBox } from "./bot_config_input_box";
import { FactoryResetRowsProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export function FactoryResetRows(props: FactoryResetRowsProps) {
  const { dispatch, sourceFbosConfig, botOnline } = props;
  const disableFactoryReset = sourceFbosConfig("disable_factory_reset");
  const maybeDisableTimer = disableFactoryReset.value ? { color: "grey" } : {};
  return <div className={"factory-reset-options"}>
    <Highlight settingName={DeviceSetting.factoryReset}>
      <Row>
        <Col xs={6}>
          <label>
            {t(DeviceSetting.factoryReset)}
          </label>
        </Col>
        <Col xs={6}>
          <button
            className="fb-button red"
            type="button"
            onClick={factoryReset}
            title={t("FACTORY RESET")}
            disabled={!botOnline}>
            {t("FACTORY RESET")}
          </button>
        </Col>
      </Row>
      <Row><p>{t(Content.FACTORY_RESET_WARNING)}</p></Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.autoFactoryReset}>
      <Row>
        <Col xs={9}>
          <label>
            {t(DeviceSetting.autoFactoryReset)}
          </label>
        </Col>
        <Col xs={3}>
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
      <Row><p>{t(Content.AUTO_FACTORY_RESET)}</p></Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.connectionAttemptPeriod}>
      <Row>
        <Col xs={12}>
          <label style={maybeDisableTimer}>
            {t(DeviceSetting.connectionAttemptPeriod)}
          </label>
        </Col>
        <Col xs={12}>
          <BotConfigInputBox
            setting="network_not_found_timer"
            dispatch={dispatch}
            disabled={!!disableFactoryReset.value}
            sourceFbosConfig={sourceFbosConfig} />
        </Col>
      </Row>
      <Row>
        <p className="network-not-found-timer">
          {t(Content.AUTO_FACTORY_RESET_PERIOD)}
        </p>
      </Row>
    </Highlight>
  </div>;
}
