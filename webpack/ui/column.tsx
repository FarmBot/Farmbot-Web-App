import * as React from "react";
import { parseClassNames } from "./util";

interface ColumnProps {
  children?: React.ReactNode | React.ReactNode[];
  /** {xs-col-size} */
  xs?: number;
  /** {sm-col-size} */
  sm?: number;
  /** {md-col-size} */
  md?: number;
  /** {lg-col-size} */
  lg?: number;
  /** {xs-col-size-offset} */
  xsOffset?: number;
  /** {sm-col-size-offset} */
  smOffset?: number;
  /** {md-col-size-offset} */
  mdOffset?: number;
  /** {lg-col-size-offset} */
  lgOffset?: number;
  /** Default hidden prop for react components. */
  hidden?: boolean;
  key?: string | number;
  className?: string;
}

export function Col(props: ColumnProps) {
  const classNames = parseClassNames(props);
  return <div
    className={classNames + " " + (props.className || "")}
    hidden={!!props.hidden}>
    {props.children}
  </div>;
}
