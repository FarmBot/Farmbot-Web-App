import * as React from "react";

export interface SaucerProps {
  color?: string;
  active?: boolean;
  className?: string;
}

/** A colored UI disc/circle. */
export function Saucer({ color, active, className }: SaucerProps) {
  const classes = ["saucer", color, className];
  if (active) { classes.push("active"); }
  return <div className={classes.join(" ")} />;
}
