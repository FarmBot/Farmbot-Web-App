import React from "react";
import { useNavigate } from "react-router";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children?: React.ReactNode | React.ReactNode[];
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  draggable?: boolean;
}

export const Link = (props: LinkProps) => {
  const navigate = useNavigate();
  return props.disabled
    ? <a {...props} />
    : <a {...props}
      href={props.to}
      onClick={
        (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          const { onClick, to } = props;
          navigate(to);
          onClick?.(e);
        }} />;
};
