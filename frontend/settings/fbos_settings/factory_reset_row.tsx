import React from "react";
import { Row, Col, docLinkClick, Help } from "../../ui";
import { Content, DeviceSetting } from "../../constants";
import { softReset } from "../../devices/actions";
import { FactoryResetRowsProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export const FactoryResetRows = (props: FactoryResetRowsProps) => {
  const { botOnline } = props;
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
  </div>;
};
