import * as React from "react";

export interface LockableButtonProps {
  onClick: Function;
  disabled: boolean;
  children?: React.ReactNode;
  title?: string;
}

export function LockableButton(props: LockableButtonProps) {
  const { onClick, disabled, children, title } = props;
  const className = disabled ? "gray" : "yellow";
  return <button
    className={"fb-button " + className}
    disabled={disabled}
    title={title}
    onClick={() => disabled ? "" : onClick()}>
    {children}
  </button>;
}
