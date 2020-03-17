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
import { DevSettings } from "../../../account/dev/dev_support";

export function FactoryResetRows(props: FactoryResetRowsProps) {
  const { dispatch, sourceFbosConfig, botOnline } = props;
  const disableFactoryReset = sourceFbosConfig("disable_factory_reset");
  const maybeDisableTimer = disableFactoryReset.value ? { color: "grey" } : {};
  const newFormat = DevSettings.futureFeaturesEnabled();
  return <div className={"factory-reset-options"}>
    <Highlight settingName={DeviceSetting.factoryReset}>
      <Row>
        <Col xs={newFormat ? 6 : ColWidth.label}>
          <label>
            {t(DeviceSetting.factoryReset)}
          </label>
        </Col>
        {!newFormat &&
          <Col xs={ColWidth.description}>
            <p>
              {t(Content.FACTORY_RESET_WARNING)}
            </p>
          </Col>}
        <Col xs={newFormat ? 6 : ColWidth.button}>
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
      {newFormat && <Row><p>{t(Content.FACTORY_RESET_WARNING)}</p></Row>}
    </Highlight>
    <Highlight settingName={DeviceSetting.autoFactoryReset}>
      <Row>
        <Col xs={newFormat ? 9 : ColWidth.label}>
          <label>
            {t(DeviceSetting.autoFactoryReset)}
          </label>
        </Col>
        {!newFormat &&
          <Col xs={ColWidth.description}>
            <p>
              {t(Content.AUTO_FACTORY_RESET)}
            </p>
          </Col>}
        <Col xs={newFormat ? 3 : ColWidth.button}>
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
      {newFormat && <Row><p>{t(Content.AUTO_FACTORY_RESET)}</p></Row>}
    </Highlight>
    <Highlight settingName={DeviceSetting.connectionAttemptPeriod}>
      <Row>
        <Col xs={newFormat ? 12 : ColWidth.label}>
          <label style={maybeDisableTimer}>
            {t(DeviceSetting.connectionAttemptPeriod)}
          </label>
        </Col>
        {!newFormat &&
          <Col xs={ColWidth.description}>
            <p style={maybeDisableTimer}>
              {t(Content.AUTO_FACTORY_RESET_PERIOD)}
            </p>
          </Col>}
        <Col xs={newFormat ? 12 : ColWidth.button}>
          <BotConfigInputBox
            setting="network_not_found_timer"
            dispatch={dispatch}
            disabled={!!disableFactoryReset.value}
            sourceFbosConfig={sourceFbosConfig} />
        </Col>
      </Row>
      {newFormat && <Row>
        <p className="network-not-found-timer">
          {t(Content.AUTO_FACTORY_RESET_PERIOD)}
        </p>
      </Row>}
    </Highlight>
  </div>;
}
