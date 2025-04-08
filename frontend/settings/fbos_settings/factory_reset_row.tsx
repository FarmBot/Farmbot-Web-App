import React from "react";
import { Row, docLinkClick, Help } from "../../ui";
import { Content, DeviceSetting } from "../../constants";
import { softReset } from "../../devices/actions";
import { FactoryResetRowsProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { useNavigate } from "react-router";

export const FactoryResetRows = (props: FactoryResetRowsProps) => {
  const { botOnline } = props;
  const navigate = useNavigate();
  return <div className={"factory-reset-options grid"}>
    <Highlight settingName={DeviceSetting.softReset}>
      <Row className="grid-exp-1">
        <div>
          <label>
            {t(DeviceSetting.softReset)}
          </label>
          <Help text={`${Content.SOFT_RESET_WARNING}
            ${t(Content.OS_RESET_WARNING, { resetMethod: t("Soft") })}`} />
        </div>
        <button
          className="fb-button red"
          type="button"
          onClick={softReset}
          title={t("SOFT RESET")}
          disabled={!botOnline}>
          {t("SOFT RESET")}
        </button>
      </Row>
    </Highlight>
    <Highlight settingName={DeviceSetting.hardReset}>
      <Row className="grid-exp-1">
        <div>
          <label>
            {t(DeviceSetting.hardReset)}
          </label>
          <Help text={`${Content.HARD_RESET_WARNING}
            ${t(Content.OS_RESET_WARNING, { resetMethod: t("Hard") })}`} />
        </div>
        <a className="link-button fb-button red"
          onClick={docLinkClick({
            slug: "farmbot-os",
            navigate,
            dispatch: props.dispatch,
          })}>
          {t("HARD RESET")}
          <i className="fa fa-external-link" />
        </a>
      </Row>
    </Highlight>
  </div>;
};
