import React from "react";
import * as THREE from "three";
import { Config } from "../../config";
import { Group, Mesh } from "../../components";
import { WaterTube } from "./water_tube";
import { easyCubicBezierCurve3, threeSpace, zDir as zDirFunc } from "../../helpers";
import { GLTF } from "three-stdlib";
import { useGLTF } from "@react-three/drei";
import { ASSETS, LIB_DIR, PartName } from "../../constants";

type SolenoidPart = GLTF & {
  nodes: { [PartName.solenoid]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}

export interface SolenoidProps {
  config: Config;
}

export const Solenoid = (props: SolenoidProps) => {
  const { config } = props;
  const {
    x, y, z, bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset,
    columnLength, zGantryOffset,
  } = config;
  const zDir = zDirFunc(config);
  const solenoid = useGLTF(ASSETS.models.solenoid, LIB_DIR) as SolenoidPart;
  return <Group>
    <WaterTube tubeName={"lower-solenoid-water-tube"}
      waterFlow={config.waterFlow}
      tubePath={easyCubicBezierCurve3(
        [
          threeSpace(x - 45, bedLengthOuter) + bedXOffset,
          threeSpace(-25, bedWidthOuter),
          -49,
        ],
        [200, -55, 25],
        [5, 10, -250],
        [
          threeSpace(x - 104.75, bedLengthOuter) + bedXOffset,
          threeSpace(20, bedWidthOuter),
          columnLength - 217,
        ],
      )}
      tubularSegments={40}
      radius={5}
      radialSegments={8} />
    <Mesh name={"solenoid"}
      position={[
        threeSpace(x - 104, bedLengthOuter) + bedXOffset,
        threeSpace(20, bedWidthOuter),
        columnLength - 200,
      ]}
      rotation={[0, 0, -Math.PI / 2]}
      scale={1000}
      geometry={solenoid.nodes[PartName.solenoid].geometry}
      material={solenoid.materials.PaletteMaterial001} />
    <WaterTube tubeName={"upper-solenoid-water-tube"}
      waterFlow={config.waterFlow}
      tubePath={easyCubicBezierCurve3(
        [
          threeSpace(x - 104.25, bedLengthOuter) + bedXOffset,
          threeSpace(20, bedWidthOuter),
          columnLength - 98,
        ],
        [0, 0, 100],
        [0, -75, 5],
        [
          threeSpace(x - 70, bedLengthOuter) + bedXOffset,
          threeSpace(35, bedWidthOuter) + bedYOffset,
          columnLength + 90,
        ],
      )}
      tubularSegments={20}
      radius={5}
      radialSegments={8} />
    <WaterTube tubeName={"y-z-water-tube"}
      waterFlow={config.waterFlow}
      tubePath={easyCubicBezierCurve3(
        [
          threeSpace(x - 70, bedLengthOuter) + bedXOffset,
          threeSpace(y + 80, bedWidthOuter) + bedYOffset,
          columnLength + 140,
        ],
        [0, -50, 0],
        [0, 0, -50],
        [
          threeSpace(x - 32.5, bedLengthOuter) + bedXOffset,
          threeSpace(y - 10, bedWidthOuter) + bedYOffset,
          columnLength + 180,
        ],
      )}
      tubularSegments={20}
      radius={5}
      radialSegments={8} />
    <WaterTube tubeName={"utm-water-tube"}
      waterFlow={config.waterFlow}
      tubePath={easyCubicBezierCurve3(
        [
          threeSpace(x + 32.5, bedLengthOuter) + bedXOffset,
          threeSpace(y - 10, bedWidthOuter) + bedYOffset,
          columnLength - zDir * z - zGantryOffset + 200,
        ],
        [0, 0, -50],
        [0, 0, 50],
        [
          threeSpace(x + 2, bedLengthOuter) + bedXOffset,
          threeSpace(y + 15, bedWidthOuter) + bedYOffset,
          columnLength - zDir * z - zGantryOffset + 75,
        ],
      )}
      tubularSegments={20}
      radius={5}
      radialSegments={8} />
  </Group>;
};
