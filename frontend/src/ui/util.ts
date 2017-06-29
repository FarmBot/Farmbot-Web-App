interface ParseClassNamesProps {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xsOffset?: number;
  smOffset?: number;
  mdOffset?: number;
  lgOffset?: number;
}

export function parseClassNames(props: ParseClassNamesProps, base: string) {

  // Base class
  let classNames = base;

  // Refactor? Add classes as needed.
  // This is the place that would change most if we switched ui libs.
  if (props.xs) { classNames += ` col-xs-${props.xs}`; }
  if (props.sm) { classNames += ` col-sm-${props.sm}`; }
  if (props.md) { classNames += ` col-md-${props.md}`; }
  if (props.lg) { classNames += ` col-lg-${props.lg}`; }
  if (props.xsOffset) { classNames += ` col-xs-offset-${props.xsOffset}`; }
  if (props.smOffset) { classNames += ` col-sm-offset-${props.smOffset}`; }
  if (props.mdOffset) { classNames += ` col-md-offset-${props.mdOffset}`; }
  if (props.lgOffset) { classNames += ` col-lg-offset-${props.lgOffset}`; }

  return classNames;

}
