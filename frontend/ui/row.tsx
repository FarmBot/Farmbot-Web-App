import React from "react";

interface RowProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function Row(props: RowProps) {
  const classNames = ["row"];
  props.className && classNames.push(props.className);
  return <div className={classNames.join(" ")}>
    {props.children}
  </div>;
}
