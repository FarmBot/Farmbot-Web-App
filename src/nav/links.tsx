import * as React from "react";
import { Link } from "react-router";

import { pathname } from "../history";

export const links = [
  { name: "Farm Designer", icon: "leaf", slug: "designer" },
  { name: "Controls", icon: "keyboard-o", slug: "controls" },
  { name: "Device", icon: "cog", slug: "device" },
  { name: "Sequences", icon: "server", slug: "sequences" },
  { name: "Regimens", icon: "calendar-check-o", slug: "regimens" },
  { name: "Tools", icon: "wrench", slug: "tools" },
  { name: "Farmware", icon: "crosshairs", slug: "farmware" }
];

if (process.env.NODE_ENV !== "production") {
  links.push({ name: "💾", icon: "leaf", slug: "debug" });
}

export const NavLinks = () => {
  return (
    <div className="links">
      <div className="nav-links">
        {links.map(link => {
          let isActive = pathname.includes(link.slug) ? "active" : "";
          return (
            <Link
              to={"/app/" + link.slug}
              className={`${isActive}`}
              key={link.slug}
            >
              <i className={`fa fa-${link.icon}`} />
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
