import React from "react";
import { Classes } from "@blueprintjs/core";
import { NavLinks } from "./nav_links";
import { MobileMenuProps } from "./interfaces";
import { Overlay } from "../ui";

const classes = [Classes.CARD, Classes.ELEVATION_4, "mobile-menu"];

export const MobileMenu = (props: MobileMenuProps) => {
  const isActive = props.mobileMenuOpen ? "active" : "inactive";
  return <div className={"mobile-menu-wrapper"}>
    <Overlay
      isOpen={props.mobileMenuOpen}
      onClose={props.close}>
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
    </Overlay>
  </div>;
};
