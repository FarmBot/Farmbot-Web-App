import * as React from "react";
import { Link } from "react-router";
import { t } from "i18next";

export const AdditionalMenu = (logout: () => void) => {
  return <div className="nav-additional-menu">
    <Link to="/app/account">
      <i className="fa fa-cog"></i>
      {t("Account Settings")}
    </Link>
    <div>
      <a
        href="https://software.farmbot.io/docs/the-farmbot-web-app"
        target="_blank">
        <i className="fa fa-file-text-o"></i>{t("Documentation")}
      </a>
    </div>
    <div>
      <a onClick={logout}>
        <i className="fa fa-sign-out"></i>
        {t("Logout")}
      </a>
    </div>
    <div className="app-version">
      <label>{t("VERSION")}</label>:&nbsp;
      <a
        href="https://github.com/FarmBot/Farmbot-Web-API"
        target="_blank"
      >
        {(process.env.SHORT_REVISION || "NONE").slice(0, 8)}
      </a>
    </div>
  </div>;
};
