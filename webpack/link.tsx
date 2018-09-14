import * as React from "react";
const a = <p />;

type AnchorProps = typeof a["props"];

interface LinkProps extends AnchorProps {
  to: string;
  children: React.ReactChild | React.ReactChild[];
  style?: React.CSSProperties;
  className?: string;
}

export function Link({ children }: LinkProps) {
  return <a onClick={() => alert("FIXME")}>{children}</a>;
}
