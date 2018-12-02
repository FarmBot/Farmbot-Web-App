import * as React from "react";
import { t } from "i18next";
import { AccountMenuProps } from "./interfaces";
import { docLink } from "../ui/doc_link";
import { Link } from "../link";

export const AdditionalMenu = (props: AccountMenuProps) => {
  return <div className="nav-additional-menu">
    <div>
      <Link to="/app/account" onClick={props.close("accountMenuOpen")}>
        <i className="fa fa-cog"></i>
        {t("Account Settings")}
      </Link>
    </div>
    {localStorage.getItem("FUTURE_FEATURES") &&
      <Link to="/app/help" onClick={props.close("accountMenuOpen")}>
        <i className="fa fa-question-circle"></i>
        {t("Help")}
      </Link>}
    <div>
      <a href={docLink("the-farmbot-web-app")}
        target="_blank">
        <i className="fa fa-file-text-o"></i>{t("Documentation")}
      </a>
    </div>
    <div>
      <a onClick={props.logout}>
        <i className="fa fa-sign-out"></i>
        {t("Logout")}
      </a>
    </div>
    <div className="app-version">
      <label>{t("VERSION")}</label>:&nbsp;
      <a
        href="https://github.com/FarmBot/Farmbot-Web-App"
        target="_blank">
        {(globalConfig.SHORT_REVISION || "NONE").slice(0, 7)}
      </a>
    </div>
  </div>;
};
