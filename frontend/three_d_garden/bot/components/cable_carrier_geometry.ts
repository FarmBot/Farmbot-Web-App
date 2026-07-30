import { Shape } from "three";

export const buildCableCarrierShape = (
  axisLength: number,
  y: number,
  curveDia: number,
  isX?: boolean,
) => {
  const lowerLength = (y + axisLength + 180) / 2;
  const upperLength = lowerLength - y;
  const outerRadius = curveDia / 2;
  const height = isX ? 15 : 20;
  const innerRadius = outerRadius - height;

  const path = new Shape();
  path.moveTo(y + 20, 0);
  path.lineTo(y + upperLength, 0);
  path.arc(0, outerRadius, outerRadius, -Math.PI / 2, Math.PI / 2);
  path.lineTo(0, curveDia);
  path.lineTo(0, curveDia - 5);
  path.lineTo(20, curveDia - height);
  path.lineTo(lowerLength, curveDia - height);
  path.arc(0, -innerRadius, innerRadius, Math.PI / 2, -Math.PI / 2, true);
  if (isX) {
    path.lineTo(y + 20, height - 1);
    path.lineTo(y, 5);
    path.lineTo(y, 0);
  } else {
    path.lineTo(y, height - 1);
    path.lineTo(y, height - 5);
  }
  path.lineTo(y + 20, 0);
  return path;
};
