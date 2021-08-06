import React from "react";
import { AccountMenuProps } from "./interfaces";
import { Link } from "../link";
import { shortRevision } from "../util";
import { t } from "../i18next_wrapper";
import { ExternalUrl } from "../external_urls";
import { Icon, iconFile } from "../farm_designer/panel_header";

export const AdditionalMenu = (props: AccountMenuProps) => {
  return <div className="nav-additional-menu">
    <div className={"account-link"}>
      <Link to="/app/designer/settings?highlight=account"
        onClick={props.close("accountMenuOpen")}>
        <img width={12} height={12} src={iconFile(Icon.settings_small)} />
        {t("Account Settings")}
      </Link>
    </div>
    <div className={"logs-link"}>
      <Link to="/app/logs" onClick={props.close("accountMenuOpen")}>
        <img width={12} height={12} src={iconFile(Icon.logs)} />
        {t("Logs")}
      </Link>
    </div>
    <div className={"setup-link"}>
      <Link to="/app/designer/setup" onClick={props.close("accountMenuOpen")}>
        <i className="fa fa-magic" />
        {t("Setup")}
      </Link>
    </div>
    <div className={"help-link"}>
      <Link to="/app/designer/help" onClick={props.close("accountMenuOpen")}>
        <i className="fa fa-question-circle" />
        {t("Help")}
      </Link>
    </div>
    <div className={"logout-link"}>
      <a onClick={props.logout} title={t("logout")}>
        <img width={12} height={12} src={iconFile(Icon.logout)} />
        {t("Logout")}
      </a>
    </div>
    <div className="app-version">
      <label>{t("APP VERSION")}</label>:&nbsp;
      <a href={ExternalUrl.webAppRepo} target="_blank" rel={"noreferrer"}>
        {shortRevision().slice(0, 8)}
      </a>
    </div>
  </div>;
};
