import React from "react";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Color, DoubleSide } from "three";

const HeightShaderMaterial = shaderMaterial(
  {
    uZMin: -1,
    uZMax: 1,
    uLowColor: new Color(0, 0, 1),
    uHighColor: new Color(1, 0, 0),
  },
  `
    varying float vZ;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vZ = worldPos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uZMin;
    uniform float uZMax;
    uniform vec3 uLowColor;
    uniform vec3 uHighColor;
    varying float vZ;

    void main() {
      float t = smoothstep(uZMin, uZMax, vZ);

      vec3 color = mix(uLowColor, uHighColor, t);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
);

extend({ HeightShaderMaterial });

export interface HeightMaterialProps {
  children?: React.ReactNode;
  min: number;
  max: number;
  lowColor: Color;
  highColor: Color;
}

export const HeightMaterial = React.memo((props: HeightMaterialProps) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <heightShaderMaterial {...props}
    // eslint-disable-next-line react/no-unknown-property
    side={DoubleSide}
    // eslint-disable-next-line react/no-unknown-property
    uZMin={props.min} uZMax={props.max}
    // eslint-disable-next-line react/no-unknown-property
    uLowColor={props.lowColor} uHighColor={props.highColor} />);
