import * as React from "react";
import { Overlay, Classes } from "@blueprintjs/core";
import { NavLinks } from "./nav_links";
import { MobileMenuProps } from "./interfaces";

const classes = [Classes.CARD, Classes.ELEVATION_4, "mobile-menu"];

export const MobileMenu = (props: MobileMenuProps) => {
  const isActive = props.mobileMenuOpen ? "active" : "inactive";
  const { alertCount } = props;
  return <div>
    <Overlay
      isOpen={props.mobileMenuOpen}
      onClose={props.close("mobileMenuOpen")}>
      <div className={`${classes.join(" ")} ${isActive}`}>
        {NavLinks({ close: props.close, alertCount })}
      </div>
    </Overlay>
  </div>;
};
