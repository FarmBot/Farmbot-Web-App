import * as React from "react";
import { Link } from "react-router";
import { AdditonalMenuProps } from "./interfaces";
import { t } from "i18next";

export let AdditionalMenu = ({ user, onClick }: AdditonalMenuProps) => {
  if (!user) {
    return <span></span>;
  } else {
    let hasName = user && user.body.name;
    let firstName = hasName ? `${hasName.split(" ")[0]} ▾` : "▾";

    return <div className="nav-dropdown">
      <div className="nav-dropdown-content">
        <ul>
          <li>
            <Link to="/app/account">
              <i className="fa fa-cog"></i>
              {t("Account Settings")}
            </Link>
          </li>
          <li>
            <a href="https://software.farmbot.io/docs/the-farmbot-web-app"
              target="_blank">
              <i className="fa fa-file-text-o"></i>{t("Documentation")}
            </a>
          </li>
          <li>
            <a onClick={onClick}>
              <i className="fa fa-sign-out"></i>
              {t("Logout")}
            </a>
          </li>
        </ul>
        <div className="version-links">
          <span>{t("Application")}:
            <a
              href="https://github.com/FarmBot/Farmbot-Web-API"
              target="_blank"
            >
              {(process.env.SHORT_REVISION || "NONE").slice(0, 8)}
            </a>
          </span>
        </div>
      </div>
    </div>;
  }
};
