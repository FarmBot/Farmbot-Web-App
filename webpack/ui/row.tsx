import * as React from "react";

interface RowProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function Row(props: RowProps) {
  const className = props.className ? props.className += " row" : "row";
  return <div className={className}>
    {props.children}
  </div>;
}
