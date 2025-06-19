import React from "react";
import {
  MeshStandardMaterial as ThreeMeshStandardMaterial,
} from "three";
import { MeshStandardMaterialProps } from "@react-three/fiber";
import { MeshStandardMaterial } from "../components";

export const FixedNormalMaterial = (props: MeshStandardMaterialProps) => {
  // eslint-disable-next-line no-null/no-null
  const materialRef = React.useRef<ThreeMeshStandardMaterial>(null);

  const attachRef = React.useCallback((material: ThreeMeshStandardMaterial) => {
    if (!material || materialRef.current) { return; }

    materialRef.current = material;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    material.onBeforeCompile = (shader: any) => {
      if (material.userData.shaderInjected) { return; }
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_begin>",
        `#include <normal_fragment_begin>
         normal = vec3(0.0, 1.0, 0.0);
        `,
      );
      material.userData.shaderInjected = true;
    };
  }, []);

  return <MeshStandardMaterial ref={attachRef} {...props} />;
};
