import * as React from "react";

export interface SaucerProps {
  color?: string;
  active?: boolean;
  className?: string;
  title?: string;
}

/** A colored UI disc/circle. */
export function Saucer({ color, active, className, title }: SaucerProps) {
  const classes = ["saucer", color, className];
  if (active) { classes.push("active"); }
  return <div className={classes.join(" ")} title={title} />;
}
