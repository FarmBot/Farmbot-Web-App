import * as React from "react";
import { Link } from "react-router";
import * as _ from "lodash";

import { history } from "../history";
import { NavLinksProps } from "./interfaces";
import { isMobile } from "../util";

export const links = [
  { name: "Farm Designer", icon: "leaf", slug: "designer" },
  { name: "Controls", icon: "keyboard-o", slug: "controls" },
  { name: "Device", icon: "cog", slug: "device" },
  { name: "Sequences", icon: "server", slug: "sequences" },
  { name: "Regimens", icon: "calendar-check-o", slug: "regimens" },
  { name: "Tools", icon: "wrench", slug: "tools" },
  { name: "Farmware", icon: "crosshairs", slug: "farmware" }
];

export const NavLinks = (props: NavLinksProps) => {
  const currPath = history.getCurrentLocation().pathname;
  const maybeToggle = () => isMobile() ? props.toggle("mobileMenuOpen") : _.noop;
  return (
    <div className="links">
      <div className="nav-links">
        {links.map(link => {
          const isActive = currPath.includes(link.slug) ? "active" : "";
          return (
            <Link
              to={"/app/" + link.slug}
              className={`${isActive}`}
              key={link.slug}
              onClick={maybeToggle()}>
              <i className={`fa fa-${link.icon}`} />
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
