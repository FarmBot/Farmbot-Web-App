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

let solarCellGeometry: ExtrudeGeometry | undefined;

const getSolarCellGeometry = () => {
  solarCellGeometry ||= new ExtrudeGeometry(cell2D(), {
    steps: 1,
    depth: cellDepth,
    bevelEnabled: false,
  });
  return solarCellGeometry;
};

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
    args={[getSolarCellGeometry(), undefined, CELL_POSITIONS.length]}
    // eslint-disable-next-line no-null/no-null
    dispose={null}>
    <SolarMaterial color={"#131361"} opacity={props.opacity}
      side={DoubleSide} />
  </InstancedMesh>;
};

const SolarPanel = React.memo(
  (props: { opacity: SolarMaterialProps["opacity"] }) => {
    return <Group rotation={[0, Math.PI / 6, 0]}>
      <Mesh renderOrder={RenderOrder.one}>
        <BoxGeometry args={[panelWidth, panelLength, panelDepth]} />
        <SolarMaterial color={"silver"} opacity={props.opacity} />
      </Mesh>
      <SolarCells opacity={props.opacity} />
    </Group>;
  });

interface SolarHardwareProps {
  bedHeight: number;
  bedLengthOuter: number;
  bedWidthOuter: number;
  bedZOffset: number;
  legSize: number;
  opacity: SolarMaterialProps["opacity"];
}

const SolarArray = React.memo((props: SolarHardwareProps) => {
  const zGround = -props.bedZOffset - props.bedHeight;
  const position: [number, number, number] = React.useMemo(() => [
    threeSpace(props.bedLengthOuter + 2000, props.bedLengthOuter),
    threeSpace(750, props.bedWidthOuter),
    zGround + 150,
  ], [props.bedLengthOuter, props.bedWidthOuter, zGround]);

  return <Group name={"solar-array"}
    position={position}
    rotation={[0, 0, Math.PI]}>
    <Group position={[0, -525, 0]}>
      <SolarPanel opacity={props.opacity} />
    </Group>
    <Group position={[0, 525, 0]}>
      <SolarPanel opacity={props.opacity} />
    </Group>
  </Group>;
});

const SolarWiring = React.memo((props: SolarHardwareProps) => {
  const zGround = -props.bedZOffset - props.bedHeight;
  const points: [number, number, number][] = React.useMemo(() => [
    [
      threeSpace(props.bedLengthOuter + 587.5 - props.legSize / 2,
        props.bedLengthOuter),
      threeSpace(props.legSize / 2, props.bedWidthOuter),
      zGround + 20,
    ],
    [
      threeSpace(props.bedLengthOuter + 600, props.bedLengthOuter),
      threeSpace(750, props.bedWidthOuter),
      zGround + 20,
    ],
    [
      threeSpace(props.bedLengthOuter + 2500, props.bedLengthOuter),
      threeSpace(750, props.bedWidthOuter),
      zGround + 20,
    ],
  ], [
    props.bedLengthOuter,
    props.bedWidthOuter,
    props.legSize,
    zGround,
  ]);

  return <AnimatedLine name={"solar-wiring"}
    renderOrder={RenderOrder.default}
    points={points}
    color={"yellow"}
    transparent={true}
    opacity={props.opacity}
    lineWidth={5} />;
});

export const Solar = (props: SolarProps) => {
  const { config } = props;
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

  const hardwareProps: SolarHardwareProps = {
    bedHeight: config.bedHeight,
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedZOffset: config.bedZOffset,
    legSize: config.legSize,
    opacity,
  };

  return <Group name={"solar"} visible={rendered}>
    <SolarArray {...hardwareProps} />
    <SolarWiring {...hardwareProps} />
  </Group>;
};
