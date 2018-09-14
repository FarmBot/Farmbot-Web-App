import * as React from "react";
import { html5LinkOnClick } from "takeme";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactChild | React.ReactChild[];
  style?: React.CSSProperties;
  className?: string;
}

export const Link: React.SFC<LinkProps> = (props) => <a
  {...props}
  onClick={e => html5LinkOnClick({ event: e.nativeEvent })}
  href={props.to} />;
