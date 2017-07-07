import * as React from "react";
import { Link } from "react-router";
import { t } from "i18next";

export const links = [
  { name: "Farm Designer", icon: "leaf", slug: "designer" },
  { name: "Controls", icon: "keyboard-o", slug: "controls" },
  { name: "Device", icon: "cog", slug: "device" },
  { name: "Sequences", icon: "server", slug: "sequences" },
  { name: "Regimens", icon: "calendar-check-o", slug: "regimens" },
  { name: "Tools", icon: "wrench", slug: "tools" },
  { name: "Farmware", icon: "crosshairs", slug: "farmware" }
];

export const NavLinks = () => {
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
  </div>;
};
