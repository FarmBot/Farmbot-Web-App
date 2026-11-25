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
  const geometry = React.useMemo(() => {
    perfCount(metric);
    return new TubeGeometry(
      tubePath,
      tubularSegments,
      radius,
      radialSegments,
    );
    // Path and radius changes reuse buffers; segment changes need new buffers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tubularSegments, radialSegments]);
  const initialized = React.useRef<TubeGeometry | undefined>(undefined);
  React.useLayoutEffect(() => {
    if (initialized.current !== geometry) {
      initialized.current = geometry;
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
