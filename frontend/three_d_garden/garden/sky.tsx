import React from "react";
import { Sky as SkyImpl } from "three-stdlib";
import { Vector3 } from "three";
import { Primitive } from "../components";

export type SkyProps = {
  sunPosition: Vector3;
}

export const Sky = React.memo((props: SkyProps) => {
  const [sky] = React.useState(() => new SkyImpl());
  const scale = React.useMemo(
    () => new Vector3().setScalar(450000),
    [],
  );
  const up = React.useMemo<[number, number, number]>(
    () => [0, 0, 1], []);

  return <Primitive
    object={sky}
    material-uniforms-mieCoefficient-value={0.01}
    material-uniforms-mieDirectionalG-value={0.9}
    material-uniforms-rayleigh-value={3}
    material-uniforms-sunPosition-value={props.sunPosition}
    material-uniforms-turbidity-value={5}
    material-uniforms-up-value={up}
    scale={scale}
    {...props} />;
});
