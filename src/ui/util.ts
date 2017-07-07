interface Props {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xsOffset?: number;
  smOffset?: number;
  mdOffset?: number;
  lgOffset?: number;
  xlOffset?: number;
}

export function parseClassNames(props: Props, base: string | null) {

  let classNames: string[] = [];
  if (base) { classNames.push(base); }

  if (props.xs) { classNames.push(`col-xs-${props.xs}`); }
  if (props.sm) { classNames.push(`col-sm-${props.sm}`); }
  if (props.md) { classNames.push(`col-md-${props.md}`); }
  if (props.lg) { classNames.push(`col-lg-${props.lg}`); }
  if (props.xsOffset) { classNames.push(`col-xs-offset-${props.xsOffset}`); }
  if (props.smOffset) { classNames.push(`col-sm-offset-${props.smOffset}`); }
  if (props.mdOffset) { classNames.push(`col-md-offset-${props.mdOffset}`); }
  if (props.lgOffset) { classNames.push(`col-lg-offset-${props.lgOffset}`); }

  return classNames.join(" ");

}
