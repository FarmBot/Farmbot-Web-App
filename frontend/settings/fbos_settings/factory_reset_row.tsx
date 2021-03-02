import React from "react";
import { Row, Col, docLinkClick, Help, ToggleButton } from "../../ui";
import { Content, DeviceSetting } from "../../constants";
import { softReset, updateConfig } from "../../devices/actions";
import { BotConfigInputBox } from "./bot_config_input_box";
import { FactoryResetRowsProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { getModifiedClassName, modifiedFromDefault } from "./default_values";
import { ConfigurationName } from "farmbot";

export function FactoryResetRows(props: FactoryResetRowsProps) {
  const { dispatch, sourceFbosConfig, botOnline, showAdvanced } = props;
  const disableFactoryReset = sourceFbosConfig("disable_factory_reset");
  const isModified = (key: ConfigurationName) =>
    modifiedFromDefault(key, sourceFbosConfig(key).value);
  const maybeDisableTimer = disableFactoryReset.value ? { color: "grey" } : {};
  return <div className={"factory-reset-options"}>
    <Highlight settingName={DeviceSetting.softReset}>
      <Row>
        <Col xs={6}>
          <label>
            {t(DeviceSetting.softReset)}
          </label>
          <Help text={`${Content.SOFT_RESET_WARNING}
            ${t(Content.OS_RESET_WARNING, { resetMethod: t("Soft") })}`} />
        </Col>
        <Col xs={6}>
          <button
            className="fb-button red"
            type="button"
            onClick={softReset}
            title={t("SOFT RESET")}
            disabled={!botOnline}>
            {t("SOFT RESET")}
          </button>
        </Col>
      </Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.hardReset}>
      <Row>
        <Col xs={6}>
          <label>
            {t(DeviceSetting.hardReset)}
          </label>
          <Help text={`${Content.HARD_RESET_WARNING}
            ${t(Content.OS_RESET_WARNING, { resetMethod: t("Hard") })}`} />
        </Col>
        <Col xs={6}>
          <a className="link-button fb-button red"
            onClick={docLinkClick("farmbot-os")}>
            {t("HARD RESET")}
            <i className="fa fa-external-link" />
          </a>
        </Col>
      </Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.autoSoftReset}
      hidden={!(showAdvanced ||
        modifiedFromDefault("disable_factory_reset", disableFactoryReset.value))}
      className={"advanced"}>
      <Row>
        <Col xs={9}>
          <label>
            {t(DeviceSetting.autoSoftReset)}
          </label>
          <Help text={Content.AUTO_SOFT_RESET} />
        </Col>
        <Col xs={3}>
          <ToggleButton
            toggleValue={!disableFactoryReset.value}
            dim={!disableFactoryReset.consistent}
            className={getModifiedClassName("disable_factory_reset",
              !!disableFactoryReset.value)}
            toggleAction={() => {
              dispatch(updateConfig({
                disable_factory_reset: !disableFactoryReset.value
              }));
            }} />
        </Col>
      </Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.connectionAttemptPeriod}
      hidden={!(showAdvanced || isModified("network_not_found_timer"))}
      className={"advanced"}>
      <Row>
        <Col xs={12}>
          <label style={maybeDisableTimer}>
            {t(DeviceSetting.connectionAttemptPeriod)}
          </label>
          <Help text={Content.AUTO_SOFT_RESET_PERIOD} />
        </Col>
        <Col xs={12}>
          <BotConfigInputBox
            setting="network_not_found_timer"
            dispatch={dispatch}
            disabled={!!disableFactoryReset.value}
            sourceFbosConfig={sourceFbosConfig} />
        </Col>
      </Row>
    </Highlight>
  </div>;
}
