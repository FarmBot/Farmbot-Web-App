import React from "react";
import {
  MeshStandardMaterial as ThreeMeshStandardMaterial,
} from "three";
import { MeshStandardMaterialProps } from "@react-three/fiber";
import { MeshStandardMaterial } from "../components";

const FIXED_NORMAL_LINE = "normal = vec3(0.0, 1.0, 0.0);";

export const applyFixedNormalShader = (shader: { fragmentShader: string }) => {
  if (shader.fragmentShader.includes(FIXED_NORMAL_LINE)) { return; }
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <normal_fragment_begin>",
    `#include <normal_fragment_begin>
     ${FIXED_NORMAL_LINE}
    `,
  );
};

export const FixedNormalMaterial = React.memo(
  (props: MeshStandardMaterialProps) => {
  // eslint-disable-next-line no-null/no-null
    const materialRef = React.useRef<ThreeMeshStandardMaterial>(null);

  const attachRef = React.useCallback((material: ThreeMeshStandardMaterial) => {
    if (!material || materialRef.current) { return; }

    materialRef.current = material;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    material.onBeforeCompile = (shader: any) => {
      applyFixedNormalShader(shader);
    };
  }, []);

    return <MeshStandardMaterial ref={attachRef} {...props} />;
  },
);
