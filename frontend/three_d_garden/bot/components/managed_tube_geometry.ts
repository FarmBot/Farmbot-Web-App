import React from "react";
import { Curve, TubeGeometry, Vector3 } from "three";
import { perfCount } from "../../../performance/perf";
import { updateBufferGeometry } from "./owned_extrude_geometry";

export const useManagedTubeGeometry = (
  tubePath: Curve<Vector3>,
  tubularSegments: number,
  radius: number,
  radialSegments: number,
  metric: string,
) => {
  const [geometry] = React.useState(() => {
    perfCount(metric);
    return new TubeGeometry(
      tubePath,
      tubularSegments,
      radius,
      radialSegments,
    );
  });
  const initialized = React.useRef(false);
  React.useLayoutEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    perfCount(metric);
    const replacement = new TubeGeometry(
      tubePath,
      tubularSegments,
      radius,
      radialSegments,
    );
    updateBufferGeometry(geometry, replacement);
    replacement.dispose();
  }, [
    geometry,
    metric,
    radialSegments,
    radius,
    tubePath,
    tubularSegments,
  ]);
  React.useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
};
