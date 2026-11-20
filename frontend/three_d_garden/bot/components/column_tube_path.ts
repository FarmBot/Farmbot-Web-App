import { CurvePath, LineCurve3, Vector3 } from "three";
import { easyCubicBezierCurve3 } from "../../helpers";

type Point = [number, number, number];

interface ColumnTubeRoute {
  end: Point;
  columnOffset: [number, number];
  faceOffset: [number, number];
  endControl: Point;
  origin?: Point;
}

export const createColumnTubePath = (route: ColumnTubeRoute) => {
  const origin = route.origin ?? [0, 0, 0];
  const point = (x: number, y: number, z: number): Point =>
    [origin[0] + x, origin[1] + y, origin[2] + z];
  const [columnX, columnY] = route.columnOffset;
  const [faceX, faceY] = route.faceOffset;
  const [endX, endY, endZ] = route.end;
  const lower = point(columnX, columnY, 80);
  const boxExit = point(columnX, columnY, endZ - 160);
  const corner = point(columnX, faceY, endZ - 145);
  const faceStart = point(faceX, faceY, endZ - 125);
  const faceEnd = point(faceX, faceY, endZ - 45);
  const path = new CurvePath<Vector3>();
  path.add(easyCubicBezierCurve3(
    point(0, 0, 0), [0, 0, 35], [0, 0, -35], lower,
  ));
  path.add(new LineCurve3(new Vector3(...lower), new Vector3(...boxExit)));
  path.add(easyCubicBezierCurve3(
    boxExit, [0, 0, 5], [0, 0, -5], corner,
  ));
  path.add(easyCubicBezierCurve3(
    corner, [0, 0, 10], [0, 0, -10], faceStart,
  ));
  path.add(new LineCurve3(new Vector3(...faceStart), new Vector3(...faceEnd)));
  path.add(easyCubicBezierCurve3(
    faceEnd, [0, 0, 20], route.endControl, point(endX, endY, endZ),
  ));
  return path;
};
