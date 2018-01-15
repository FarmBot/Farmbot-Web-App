import * as React from "react";
import { JSXChildren } from "../util";
import { NetworkState } from "../connectivity/interfaces";

/** Properties for the <MustBeOnline/> element. */
export interface MBOProps {
  status: NetworkState;
  lockOpen?: boolean;
  hideBanner?: boolean;
  children?: JSXChildren;
}

export function MustBeOnline({ children, hideBanner, lockOpen, status }: MBOProps) {
  const banner = hideBanner ? "" : "banner";
  const online = status === "up";
  if (online || lockOpen) {
    return <div> {children} </div>;
  } else {
    return <div className={`unavailable ${banner}`}> {children} </div>;
  }
}
