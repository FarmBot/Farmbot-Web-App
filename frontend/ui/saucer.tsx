import React from "react";

export interface SaucerProps {
  color?: string;
  active?: boolean;
  className?: string;
  title?: string;
  children?: React.ReactNode;
}

/** A colored UI disc/circle. */
export function Saucer({ color, active, className, title, children }: SaucerProps) {
  const classes = ["saucer", color, className];
  if (active) { classes.push("active"); }
  return <div className={classes.join(" ")} title={title}>{children}</div>;
}
