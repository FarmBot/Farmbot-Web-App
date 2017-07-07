import * as React from "react";
import { Overlay, Classes } from "@blueprintjs/core";

import { NavLinks } from "./links";
import { MobileMenuProps } from "./interfaces";

let classes = [Classes.CARD, Classes.ELEVATION_4, "mobile-menu"];

export let MobileMenu = (props: MobileMenuProps) => {
  let isActive = props.mobileMenuOpen ? "active" : "inactive";
  return (
    <div>
      <Overlay
        isOpen={props.mobileMenuOpen}
        onClose={props.toggle("mobileMenuOpen")}
      >
        <div className={`${classes.join(" ")} ${isActive}`}>
          {NavLinks()}
        </div>
      </Overlay>
    </div>
  );
};
