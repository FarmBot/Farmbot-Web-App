import * as React from "react";

interface Props {
  onClick: Function;
  disabled: boolean;
  children?: React.ReactNode;
  title?: string;
}

export function LockableButton({ onClick, disabled, children, title }: Props) {
  const className = disabled ? "gray" : "yellow";
  return <button
    className={"fb-button " + className}
    disabled={disabled}
    title={title}
    onClick={() => disabled ? "" : onClick()}>
    {children}
  </button>;
}
