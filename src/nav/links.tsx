import * as React from "react";
import { Link } from "react-router";
import { t } from "i18next";

let links = [
  { name: "Farm Designer", icon: "leaf", slug: "designer" },
  { name: "Controls", icon: "keyboard-o", slug: "controls" },
  { name: "Device", icon: "cog", slug: "device" },
  { name: "Sequences", icon: "server", slug: "sequences" },
  { name: "Regimens", icon: "calendar-check-o", slug: "regimens" },
  { name: "Tools", icon: "wrench", slug: "tools" },
  { name: "Farmware", icon: "crosshairs", slug: "farmware" },
];

export let NavLinks = (logout: () => void) => {
  return <div className="links">
    <div className="nav-links">
      {links.map(link => {
        return <Link
          to={"/app/" + link.slug}
          activeClassName="active"
          key={link.slug}
        >
          <i className={`fa fa-${link.icon}`} />
          {link.name}
        </Link>;
      })}
    </div>
    <div className="external-links">
      <Link to="/app/account">
        <i className="fa fa-cog"></i>{t("Account")}
      </Link>
      <a
        href="https://software.farmbot.io/docs/the-farmbot-web-app"
        target="_blank"
      >
        <i className="fa fa-file-text-o"></i>{t("Documentation")}
      </a>
      {t("Frontend")}:
      <a
        href="https://github.com/FarmBot/farmbot-web-frontend"
        target="_blank"
      >
        {/** SHORT_REVISION is the last frontend commit. */}
        {process.env.SHORT_REVISION}
      </a>
      <a onClick={logout}>
        <i className="fa fa-sign-out"></i>{t("Logout")}
      </a>
    </div>
  </div>;
};
