import * as React from "react";

interface Props {
  onClick: Function;
  disabled: boolean;
  children?: React.ReactNode;
}

export function LockableButton({ onClick, disabled, children }: Props) {
  const className = disabled ? "gray" : "yellow";
  return <button
    className={"fb-button " + className}
    disabled={disabled}
    onClick={() => disabled ? "" : onClick()}>
    {children}
  </button>;
}
