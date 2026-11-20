import React from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { useGLTF } from "@react-three/drei";
import { Config } from "../../config";
import { ASSETS, LIB_DIR, PartName } from "../../constants";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { VacuumPumpCoverFull, VacuumPumpCoverModel } from "../parts";
import { EXTRUSION_WIDTH } from "../assemblies/constants";
import { createColumnTubePath } from "./column_tube_path";
import { useManagedTubeGeometry } from "./managed_tube_geometry";

type VacuumPump = GLTF & {
  nodes: { [PartName.vacuumPump]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}

interface ColumnVacuumPumpProps {
  config: Pick<Config, "bedYOffset" | "columnLength" | "tracks">;
}

export const createVacuumReturnPath = (
  config: ColumnVacuumPumpProps["config"],
) => {
  const { columnLength, bedYOffset, tracks } = config;
  const columnYOffset = tracks ? 0 : EXTRUSION_WIDTH;
  // Cut stub center in the GLB: (90.5, -61.075, 120) mm, below the filter.
  const bottom = columnLength - 190 - 137.454;
  const join: [number, number, number] = [22.03, -76.5, 59.5 - (bottom - 75)];
  // Follow the valve tube 12 mm to its +X side, including the carrier entry.
  const paired = createColumnTubePath({
    origin: join,
    end: [-31.105, 76 + bedYOffset - columnYOffset, columnLength + 30.5],
    columnOffset: [-4.105, 26 - columnYOffset],
    faceOffset: [-44.105, 46],
    endControl: [0, -25, 0],
  });
  // Join 60 mm along the valve route and retain the exact remaining curve.
  const first = paired.curves[0] as THREE.CubicBezierCurve3;
  const t = first.getUtoTmapping(0, 60);
  const a = first.v0.clone().lerp(first.v1, t);
  const b = first.v1.clone().lerp(first.v2, t);
  const c = first.v2.clone().lerp(first.v3, t);
  const d = a.clone().lerp(b, t);
  const e = b.clone().lerp(c, t);
  const meetingPoint = d.clone().lerp(e, t);
  const tangent = first.getTangent(t);
  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(new THREE.CubicBezierCurve3(
    new THREE.Vector3(), new THREE.Vector3(0, 0, -25),
    meetingPoint.clone().addScaledVector(tangent, -25), meetingPoint,
  ));
  path.add(new THREE.CubicBezierCurve3(
    meetingPoint, e, c, first.v3.clone(),
  ));
  paired.curves.slice(1).forEach(curve => path.add(curve));
  return path;
};

export const ColumnVacuumPump = React.memo((props: ColumnVacuumPumpProps) => {
  const { bedYOffset, columnLength, tracks } = props.config;
  const pump = useGLTF(
    ASSETS.models.vacuumPumpV19, LIB_DIR,
  ) as unknown as VacuumPump;
  const cover = useGLTF(
    ASSETS.models.vacuumPumpCover, LIB_DIR,
  ) as unknown as VacuumPumpCoverFull;
  const columnYOffset = tracks ? 0 : EXTRUSION_WIDTH;
  // The box lid extends 137.454 mm below its anchor at columnLength - 190.
  const bottom = columnLength - 190 - 137.454;
  const returnPath = React.useMemo(() => createVacuumReturnPath({
    bedYOffset, columnLength, tracks,
  }), [bedYOffset, columnLength, tracks]);
  const returnGeometry = useManagedTubeGeometry(
    returnPath, 160, 4.7625, 8, "bot.geometry.tube.vacuum.return",
  );
  return <>
    <Group name={"column-vacuum-pump"}
      position={[-108, columnYOffset - bedYOffset - 10, bottom]}
      rotation={[0, 0, Math.PI / 2]}>
      <VacuumPumpCoverModel
        name={"vacuumPumpHousing"}
        model={cover}
        reverseMountScrews={true}
        position={[10, 8, 255]} />
      <Mesh name={"vacuumPump"}
        geometry={pump.nodes[PartName.vacuumPump].geometry}
        material={pump.materials.PaletteMaterial001}
        position={[-45, -8, -195]}
        scale={1000} />
    </Group>
    <Mesh name={"vacuum-return-tube"}
      position={[-38.925, columnYOffset - bedYOffset + 35.5, bottom - 75]}
      geometry={returnGeometry}>
      <MeshPhongMaterial color={"white"}
        transparent={true} opacity={0.75} />
    </Mesh>
  </>;
});
