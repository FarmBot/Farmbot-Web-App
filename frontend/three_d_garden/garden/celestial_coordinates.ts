export const toRad = (degrees: number) => degrees * Math.PI / 180;

export const polarToCartesian = (
  radius: number,
  thetaDegrees: number,
  phiDegrees: number,
): [number, number, number] => {
  const theta = toRad(thetaDegrees);
  const phi = toRad(phiDegrees);
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  ];
};
