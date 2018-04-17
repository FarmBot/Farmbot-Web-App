import * as React from "react";
import { t } from "i18next";
import { Link } from "react-router";
import { NavLinksProps } from "./interfaces";
import { getPathArray } from "../history";

export const links = [
  { name: "Farm Designer", icon: "leaf", slug: "designer" },
  { name: "Controls", icon: "keyboard-o", slug: "controls" },
  { name: "Device", icon: "cog", slug: "device" },
  { name: "Sequences", icon: "server", slug: "sequences" },
  { name: "Regimens", icon: "calendar-check-o", slug: "regimens" },
  { name: "Tools", icon: "wrench", slug: "tools" },
  { name: "Farmware", icon: "crosshairs", slug: "farmware" },
  { name: "Logs", icon: "list", slug: "logs" },
];

export const NavLinks = (props: NavLinksProps) => {
  const currPageSlug = getPathArray()[2];
  return <div className="links">
    <div className="nav-links">
      {links.map(link => {
        const isActive = (currPageSlug === link.slug) ? "active" : "";
        const childPath = link.slug === "designer" ? "/plants" : "";
        return <Link
          to={"/app/" + link.slug + childPath}
          className={`${isActive}`}
          key={link.slug}
          onClick={props.close("mobileMenuOpen")}>
          <i className={`fa fa-${link.icon}`} />
          {t(link.name)}
        </Link>;
      })}
    </div>
  </div>;
};
