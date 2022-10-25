import React from "react";
import { push } from "./history";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children?: React.ReactChild | React.ReactChild[];
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  draggable?: boolean;
}

export const clickHandler =
  (props: LinkProps) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const { onClick, to } = props;
    push(to);
    onClick?.(e);
  };

export class Link extends React.Component<LinkProps, {}> {
  render() {
    const { props } = this;
    return props.disabled
      ? <a {...props} />
      : <a {...props} href={props.to} onClick={clickHandler(props)} />;
  }
}
