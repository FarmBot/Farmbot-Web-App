import * as React from "react";
import { SyncStatus } from "farmbot/dist";
import { JSXChildren } from "../util";

/** Properties for the <MustBeOnline/> element. */
export interface MBOProps {
  status: SyncStatus | undefined;
  lockOpen?: boolean;
  fallback?: string | undefined;
  children?: JSXChildren;
}

export function MustBeOnline({ children, lockOpen, fallback, status }: MBOProps) {
  if (lockOpen || (status && (status !== "unknown"))) {
    return <div> {children} </div>;
  } else {
    return <div> {fallback || ""} </div>;
  }
}
