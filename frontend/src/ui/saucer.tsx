import * as React from "react";

export interface SaucerProps {
  color?: string;
  active?: boolean;
};

/** A colored UI disc/circle. */
export function Saucer({ color, active }: SaucerProps) {
  let className = `saucer ${color}`;
  if (active) { className += " active"; }
  return <div className={className} />;
}
