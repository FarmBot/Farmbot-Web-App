import * as React from "react";
import { navigate } from "takeme";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children?: React.ReactChild | React.ReactChild[];
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

export const maybeStripLegacyUrl =
  (url: string) => url.startsWith("/app") ? url.replace("/app", "") : url;

export const clickHandler =
  (props: LinkProps) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    /** BEGIN LEGACY SHIMS */
    const { onClick, to } = props;
    navigate(maybeStripLegacyUrl(to));
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
