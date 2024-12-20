import React from "react";
import { Overlay2, Classes } from "@blueprintjs/core";
import { NavLinks } from "./nav_links";
import { MobileMenuProps } from "./interfaces";

const classes = [Classes.CARD, Classes.ELEVATION_4, "mobile-menu"];

export const MobileMenu = (props: MobileMenuProps) => {
  const isActive = props.mobileMenuOpen ? "active" : "inactive";
  return <div className={"mobile-menu-wrapper"}>
    <Overlay2
      isOpen={props.mobileMenuOpen}
      onClose={props.close("mobileMenuOpen")}>
      <div className={`${classes.join(" ")} ${isActive}`}
        role={"navigation"}
        aria-label={"Mobile Panel Menu"}>
        <NavLinks
          designer={props.designer}
          dispatch={props.dispatch}
          close={props.close}
          alertCount={props.alertCount}
          helpState={props.helpState} />
      </div>
    </Overlay2>
  </div>;
};
