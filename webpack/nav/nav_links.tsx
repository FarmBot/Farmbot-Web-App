import * as React from "react";
import { Link } from "react-router";
import { history } from "../history";
import { NavLinksProps } from "./interfaces";

export const links = [
  { name: "Farm Designer", icon: "leaf", slug: "designer" },
  { name: "Controls", icon: "keyboard-o", slug: "controls" },
  { name: "Device", icon: "cog", slug: "Device" },
  { name: "Sequence", icon: "server", slug: "Sequence" },
  { name: "Regimen", icon: "calendar-check-o", slug: "Regimen" },
  { name: "Tool", icon: "wrench", slug: "Tool" },
  { name: "Farmware", icon: "crosshairs", slug: "farmware" }
];

export const NavLinks = (props: NavLinksProps) => {
  const currPath = history.getCurrentLocation().pathname;
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
              onClick={props.close("mobileMenuOpen")}>
              <i className={`fa fa-${link.icon}`} />
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
