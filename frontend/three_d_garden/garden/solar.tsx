import React from "react";
import {
  DoubleSide, ExtrudeGeometry, InstancedMesh as ThreeInstancedMesh,
  Object3D, Shape,
} from "three";
import { Line } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { SpringValue } from "@react-spring/core";
import { threeSpace } from "../helpers";
import { Config } from "../config";
import {
  Group, Mesh, BoxGeometry, MeshPhongMaterial, InstancedMesh,
} from "../components";
import { easeInOutCubic, useFocusTransition } from "../focus_transition";
import { RenderOrder } from "../constants";

export interface SolarProps {
  config: Config;
  activeFocus: string;
}

const panelWidth = 540;
const panelLength = 1040;
const panelDepth = 30;
const cellDepth = 2;
const cellZ = panelDepth / 2 + cellDepth + 1;
const AnimatedMeshPhongMaterial = animated(MeshPhongMaterial);
const AnimatedLine = animated(Line);

const cell2D = () => {
  const cellSize = 95;
  const cellBevel = 15;
  const path = new Shape();
  path.moveTo(cellBevel, 0);
  path.lineTo(cellSize - cellBevel, 0);
  path.lineTo(cellSize, cellBevel);
  path.lineTo(cellSize, cellSize - cellBevel);
  path.lineTo(cellSize - cellBevel, cellSize);
  path.lineTo(cellBevel, cellSize);
  path.lineTo(0, cellSize - cellBevel);
  path.lineTo(0, cellBevel);
  return path;
};

const cellPositions = () => {
  const positions: [number, number, number][] = [];
  const cellSize = 100;
  const cellsWide = Math.floor(panelWidth / cellSize);
  const cellsLong = Math.floor(panelLength / cellSize);

  for (let x = 0; x < cellsWide; x++) {
    for (let y = 0; y < cellsLong; y++) {
      const xPos = x * cellSize - (panelWidth / 2) + 20 + 2.5;
      const yPos = y * cellSize - (panelLength / 2) + 20 + 2.5;
      positions.push([xPos, yPos, cellZ]);
    }
  }
  return positions;
};

const CELL_POSITIONS = cellPositions();

interface SolarMaterialProps {
  opacity: number | SpringValue<number>;
  color: string;
  side?: typeof DoubleSide;
}

const SolarMaterial = (props: SolarMaterialProps) =>
  <AnimatedMeshPhongMaterial
    color={props.color}
    opacity={props.opacity}
    side={props.side}
    transparent={true}
    depthWrite={false} />;

const SolarCells = (props: { opacity: SolarMaterialProps["opacity"] }) => {
  const geometry = React.useMemo(
    () => new ExtrudeGeometry(cell2D(), {
      steps: 1,
      depth: cellDepth,
      bevelEnabled: false,
    }),
    [],
  );
  const setRef = React.useCallback((mesh: ThreeInstancedMesh | null) => {
    if (!mesh || typeof mesh.setMatrixAt != "function") { return; }
    const dummy = new Object3D();
    CELL_POSITIONS.map((position, index) => {
      dummy.position.set(...position);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return <InstancedMesh
    ref={setRef}
    renderOrder={RenderOrder.one + 1}
    frustumCulled={false}
    args={[geometry, undefined, CELL_POSITIONS.length]}>
    <SolarMaterial color={"#131361"} opacity={props.opacity}
      side={DoubleSide} />
  </InstancedMesh>;
};

const SolarPanel = (props: { opacity: SolarMaterialProps["opacity"] }) => {
  return <Group rotation={[0, Math.PI / 6, 0]}>
    <Mesh renderOrder={RenderOrder.one}>
      <BoxGeometry args={[panelWidth, panelLength, panelDepth]} />
      <SolarMaterial color={"silver"} opacity={props.opacity} />
    </Mesh>
    <SolarCells opacity={props.opacity} />
  </Group>;
};

export const Solar = (props: SolarProps) => {
  const { config } = props;
  const zGround = -config.bedZOffset - config.bedHeight;
  const transition = useFocusTransition();
  const visible = config.solar || props.activeFocus == "What you need to provide";
  const { opacity } = useSpring({
    opacity: visible ? 1 : 0,
    immediate: !transition.enabled,
    config: {
      duration: transition.duration,
      easing: easeInOutCubic,
    },
  });
  const rendered = transition.enabled || visible;
  if (!rendered) { return undefined; }

  return <Group name={"solar"} visible={rendered}>
    <Group name={"solar-array"}
      position={[
        threeSpace(config.bedLengthOuter + 2000, config.bedLengthOuter),
        threeSpace(750, config.bedWidthOuter),
        zGround + 150,
      ]}
      rotation={[0, 0, Math.PI]}>
      <Group position={[0, -525, 0]}>
        <SolarPanel opacity={opacity} />
      </Group>
      <Group position={[0, 525, 0]}>
        <SolarPanel opacity={opacity} />
      </Group>
    </Group>
    <AnimatedLine name={"solar-wiring"}
      renderOrder={RenderOrder.default}
      points={[
        [
          threeSpace(config.bedLengthOuter + 587.5 - config.legSize / 2,
            config.bedLengthOuter),
          threeSpace(config.legSize / 2, config.bedWidthOuter),
          zGround + 20,
        ],
        [
          threeSpace(config.bedLengthOuter + 600, config.bedLengthOuter),
          threeSpace(750, config.bedWidthOuter),
          zGround + 20,
        ],
        [
          threeSpace(config.bedLengthOuter + 2500, config.bedLengthOuter),
          threeSpace(750, config.bedWidthOuter),
          zGround + 20,
        ]]}
      color={"yellow"}
      transparent={true}
      opacity={opacity}
      lineWidth={5} />
  </Group>;
};
