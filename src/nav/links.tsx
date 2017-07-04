import * as React from "react";
import { Link } from "react-router";
import { t } from "i18next";

let links = [
  { name: "Farm Designer", icon: "leaf", url: "/app/designer" },
  { name: "Controls", icon: "keyboard-o", url: "/app/controls" },
  { name: "Device", icon: "cog", url: "/app/device" },
  { name: "Sequences", icon: "server", url: "/app/sequences" },
  { name: "Regimens", icon: "calendar-check-o", url: "/app/regimens" },
  { name: "Tools", icon: "wrench", url: "/app/tools" },
  { name: "Farmware", icon: "crosshairs", url: "/app/farmware" },
  { name: "Account", icon: "cog", url: "/app/account" },
  { name: "Logout", icon: "sign-out", url: "" }
];

export let NavLinks = () => {
  <div className="links">
    {links.map(link => {
      return <Link
        to={link.url}
        activeClassName="active"
        key={link.url}
      >
        <i className={`fa fa-${link.icon}`} />
        {link.name}
      </Link>;
    })}
    <a href="https://software.farmbot.io/docs/the-farmbot-web-app"
      target="_blank">
      <i className="fa fa-file-text-o"></i>{t("Documentation")}
    </a>
    <div className="version-links">
      {t("Frontend")}:
      <a
        href="https://github.com/FarmBot/farmbot-web-frontend"
        target="_blank"
      >
        {/** SHORT_REVISION is the last frontend commit. */}
        {process.env.SHORT_REVISION}
      </a>
    </div>
  </div>;
};
