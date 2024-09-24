// Forked from https://github.com/pmndrs/drei/blob/master/src/core/Sky.tsx

import React from "react";
import { Vector3 as Vector3Type } from "@react-three/fiber";
import { Sky as SkyImpl } from "three-stdlib";
import { Vector3 } from "three";
import { ForwardRefComponent } from "@react-three/drei/helpers/ts-utils";
import { Primitive } from "./components";

export type SkyProps = {
  distance?: number
  sunPosition?: Vector3Type
  mieCoefficient?: number
  mieDirectionalG?: number
  rayleigh?: number
  turbidity?: number
  up?: Vector3Type
}

export const Sky: ForwardRefComponent<SkyProps, SkyImpl> =
  /* @__PURE__ */
  React.forwardRef((
    {
      distance = 1000,
      mieCoefficient = 0.005,
      mieDirectionalG = 0.8,
      rayleigh = 0.5,
      turbidity = 10,
      sunPosition = [0, 5000, 0],
      up = [0, 0, 1],
      ...props
    }: SkyProps,
    ref,
  ) => {
    const scale = React.useMemo(() => new Vector3()
      .setScalar(distance), [distance]);
    const [sky] = React.useState(() => new SkyImpl());

    return <Primitive
      object={sky}
      ref={ref}
      material-uniforms-mieCoefficient-value={mieCoefficient}
      material-uniforms-mieDirectionalG-value={mieDirectionalG}
      material-uniforms-rayleigh-value={rayleigh}
      material-uniforms-sunPosition-value={sunPosition}
      material-uniforms-turbidity-value={turbidity}
      material-uniforms-up-value={up}
      scale={scale}
      {...props}
    />;
  });
