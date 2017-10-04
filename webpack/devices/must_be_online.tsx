import * as React from "react";
import { SyncStatus } from "farmbot/dist";
import { JSXChildren } from "../util";

/** Properties for the <MustBeOnline/> element. */
export interface MBOProps {
  status: SyncStatus | undefined;
  lockOpen?: boolean;
  hideBanner?: boolean;
  children?: JSXChildren;
}

export function MustBeOnline({ children, hideBanner, lockOpen, status }: MBOProps) {
  const banner = !hideBanner ? "banner" : "";
  if (lockOpen || (status && (status !== "unknown"))) {
    return <div> {children} </div>;
  } else {
    return <div className={`unavailable ${banner}`}> {children} </div>;
  }
}
