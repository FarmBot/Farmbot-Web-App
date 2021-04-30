import React from "react";

export interface LockableButtonProps {
  onClick: Function;
  disabled: boolean;
  children?: React.ReactNode;
  title?: string;
  className?: string;
}

export function LockableButton(props: LockableButtonProps) {
  const { onClick, disabled, children, title, className } = props;
  return <button
    className={[
      "fb-button",
      disabled ? "gray" : "yellow",
      className,
    ].join(" ")}
    disabled={disabled}
    title={title}
    onClick={() => disabled ? "" : onClick()}>
    {children}
  </button>;
}
