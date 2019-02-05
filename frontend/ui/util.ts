import { isUndefined } from "lodash";

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

export function parseClassNames(props: Props, base?: string) {

  const classNames: string[] = [];
  if (base) { classNames.push(base); }

  if (props.xs) { classNames.push(`col-xs-${props.xs}`); }
  if (props.sm) { classNames.push(`col-sm-${props.sm}`); }
  if (props.md) { classNames.push(`col-md-${props.md}`); }
  if (props.lg) { classNames.push(`col-lg-${props.lg}`); }
  const { xsOffset, smOffset, mdOffset, lgOffset } = props;
  if (!isUndefined(xsOffset)) { classNames.push(`col-xs-offset-${xsOffset}`); }
  if (!isUndefined(smOffset)) { classNames.push(`col-sm-offset-${smOffset}`); }
  if (!isUndefined(mdOffset)) { classNames.push(`col-md-offset-${mdOffset}`); }
  if (!isUndefined(lgOffset)) { classNames.push(`col-lg-offset-${lgOffset}`); }

  return classNames.join(" ");

}
