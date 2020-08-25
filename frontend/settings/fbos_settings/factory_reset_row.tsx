import * as React from "react";
import { Row, Col, docLink } from "../../ui/index";
import { Content, DeviceSetting } from "../../constants";
import { softReset, updateConfig } from "../../devices/actions";
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
    <Highlight settingName={DeviceSetting.softReset}>
      <Row>
        <Col xs={6}>
          <label>
            {t(DeviceSetting.softReset)}
          </label>
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
      <Row><p>{t(Content.SOFT_RESET_WARNING)}</p></Row>
      <Row className={"os-reset-warning"}>
        <p>{t(Content.OS_RESET_WARNING, { resetMethod: t("Soft") })}</p>
      </Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.hardReset}>
      <Row>
        <Col xs={6}>
          <label>
            {t(DeviceSetting.hardReset)}
          </label>
        </Col>
        <Col xs={6}>
          <a className="link-button fb-button red"
            href={docLink("farmbot-os#section-installation")} target="_blank"
            title={t("Open link in a new tab")}>
            {t("HARD RESET")}
            <i className="fa fa-external-link" />
          </a>
        </Col>
      </Row>
      <Row><p>{t(Content.HARD_RESET_WARNING)}</p></Row>
      <Row className={"os-reset-warning"}>
        <p>{t(Content.OS_RESET_WARNING, { resetMethod: t("Hard") })}</p>
      </Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.autoSoftReset}>
      <Row>
        <Col xs={9}>
          <label>
            {t(DeviceSetting.autoSoftReset)}
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
      <Row><p>{t(Content.AUTO_SOFT_RESET)}</p></Row>
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
          {t(Content.AUTO_SOFT_RESET_PERIOD)}
        </p>
      </Row>
    </Highlight>
  </div>;
}
