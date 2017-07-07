import * as React from "react";
import { Link } from "react-router";
import { t } from "i18next";

import { history } from "../history";

export const links = [
  { name: "Farm Designer", icon: "leaf", slug: "designer" },
  { name: "Controls", icon: "keyboard-o", slug: "controls" },
  { name: "Device", icon: "cog", slug: "device" },
  { name: "Sequences", icon: "server", slug: "sequences" },
  { name: "Regimens", icon: "calendar-check-o", slug: "regimens" },
  { name: "Tools", icon: "wrench", slug: "tools" },
  { name: "Farmware", icon: "crosshairs", slug: "farmware" }
];

let classNames = ["hidden-xs"];

export const NavLinks = () => {
  let currPath = history.getCurrentLocation().pathname;
  return <div className="links">
    <div className="nav-links">
      {links.map(link => {
        currPath.includes(link.slug) && classNames.push("active");
        return <Link
          to={"/app/" + link.slug}
          className={classNames.join(" ")}
          key={link.slug}
        >
          <i className={`fa fa-${link.icon}`} />
          {link.name}
        </Link>;
      })}
    </div>
  </div>;
};
