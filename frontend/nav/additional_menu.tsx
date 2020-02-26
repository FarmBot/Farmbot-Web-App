import * as React from "react";
import { AccountMenuProps } from "./interfaces";
import { Link } from "../link";
import { shortRevision } from "../util";
import { t } from "../i18next_wrapper";
import { ExternalUrl } from "../external_urls";

export const AdditionalMenu = (props: AccountMenuProps) => {
  return <div className="nav-additional-menu">
    <div>
      <Link to="/app/account" onClick={props.close("accountMenuOpen")}>
        <i className="fa fa-cog" />
        {t("Account Settings")}
      </Link>
    </div>
    <div>
      <Link to="/app/logs" onClick={props.close("accountMenuOpen")}>
        <i className="fa fa-list" />
        {t("Logs")}
      </Link>
    </div>
    <Link to="/app/help" onClick={props.close("accountMenuOpen")}>
      <i className="fa fa-question-circle" />
      {t("Help")}
    </Link>
    <div>
      <a onClick={props.logout}>
        <i className="fa fa-sign-out" />
        {t("Logout")}
      </a>
    </div>
    <div className="app-version">
      <label>{t("VERSION")}</label>:&nbsp;
      <a href={ExternalUrl.webAppRepo} target="_blank">
        {shortRevision().slice(0, 8)}
      </a>
    </div>
  </div>;
};
