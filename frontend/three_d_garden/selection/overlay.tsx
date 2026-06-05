import React from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { range } from "lodash";
import {
  BufferAttribute, Color, DoubleSide, InstancedBufferAttribute,
  InstancedBufferGeometry, ShaderMaterial,
} from "three";
import { Group, Mesh } from "../components";
import { Config } from "../config";
import {
  extents as extentsFunc, zero as zeroFunc,
} from "../helpers";
import { ResolvedThreeDObjectBase } from "./resolve";

const RING_SEGMENTS = 192;
const RING_Z_OFFSET = 6;
const RING_THICKNESS = 4;
const RING_DASH_SIZE = 14;
const RING_GAP_SIZE = 10;
const RING_DASH_SPEED = 45;
const FULL_CIRCLE = Math.PI * 2;

type RingObject = Pick<ResolvedThreeDObjectBase,
  "worldPosition" | "ringRadius">;

const createRingGeometry = (objects: RingObject[]) => {
  const vertexCount = (RING_SEGMENTS + 1) * 2;
  const geometry = new InstancedBufferGeometry();
  const positions = new Float32Array(vertexCount * 3);
  const angles = new Float32Array(vertexCount);
  const sides = new Float32Array(vertexCount);
  const indices = new Uint16Array(RING_SEGMENTS * 6);

  range(RING_SEGMENTS + 1).forEach(index => {
    const angle = index / RING_SEGMENTS * FULL_CIRCLE;
    const vertexIndex = index * 2;
    angles[vertexIndex] = angle;
    angles[vertexIndex + 1] = angle;
    sides[vertexIndex] = -1;
    sides[vertexIndex + 1] = 1;
  });
  range(RING_SEGMENTS).forEach(index => {
    const vertexIndex = index * 2;
    const indexOffset = index * 6;
    indices[indexOffset] = vertexIndex;
    indices[indexOffset + 1] = vertexIndex + 2;
    indices[indexOffset + 2] = vertexIndex + 1;
    indices[indexOffset + 3] = vertexIndex + 1;
    indices[indexOffset + 4] = vertexIndex + 2;
    indices[indexOffset + 5] = vertexIndex + 3;
  });

  const instancePositions = new Float32Array(objects.length * 3);
  const instanceRadii = new Float32Array(objects.length);
  objects.forEach((object, index) => {
    const [x, y, z] = object.worldPosition;
    const offset = index * 3;
    instancePositions[offset] = x;
    instancePositions[offset + 1] = y;
    instancePositions[offset + 2] = z + RING_Z_OFFSET;
    instanceRadii[index] = object.ringRadius;
  });

  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("ringAngle", new BufferAttribute(angles, 1));
  geometry.setAttribute("ringSide", new BufferAttribute(sides, 1));
  geometry.setAttribute("ringInstancePosition",
    new InstancedBufferAttribute(instancePositions, 3));
  geometry.setAttribute("ringInstanceRadius",
    new InstancedBufferAttribute(instanceRadii, 1));
  geometry.instanceCount = objects.length;
  return geometry;
};

const createRingMaterial = () =>
  new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color("white") },
      uDashSize: { value: RING_DASH_SIZE },
      uDashOffset: { value: 0 },
      uGapSize: { value: RING_GAP_SIZE },
      uOpacity: { value: 0.95 },
      uThickness: { value: RING_THICKNESS },
    },
    vertexShader: `
      attribute float ringAngle;
      attribute float ringSide;
      attribute vec3 ringInstancePosition;
      attribute float ringInstanceRadius;

      uniform float uThickness;

      varying float vAngle;
      varying float vRadius;

      void main() {
        float angle = ringAngle;
        float radius =
          max(ringInstanceRadius + ringSide * uThickness * 0.5, 0.0);
        vec3 ringPosition = ringInstancePosition + vec3(
          cos(angle) * radius,
          sin(angle) * radius,
          0.0
        );
        vAngle = ringAngle;
        vRadius = ringInstanceRadius;
        gl_Position = projectionMatrix * modelViewMatrix
          * vec4(ringPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uDashOffset;
      uniform float uDashSize;
      uniform float uGapSize;
      uniform float uOpacity;

      varying float vAngle;
      varying float vRadius;

      void main() {
        float patternSize = uDashSize + uGapSize;
        float dashPosition = mod(vAngle * vRadius + uDashOffset, patternSize);
        if (dashPosition > uDashSize) { discard; }
        gl_FragColor = vec4(uColor, uOpacity);
      }
    `,
    depthWrite: false,
    side: DoubleSide,
    transparent: true,
  });

interface SelectedObjectRingsProps {
  objects: RingObject[];
}

export const SelectedObjectRings = (props: SelectedObjectRingsProps) => {
  const geometry = React.useMemo(
    () => createRingGeometry(props.objects),
    [props.objects]);
  const material = React.useMemo(() => createRingMaterial(), []);
  const materialRef = React.useRef<ShaderMaterial | undefined>(material);

  React.useEffect(() => () => geometry.dispose(), [geometry]);
  React.useEffect(() => {
    materialRef.current = material;
    return () => {
      materialRef.current = undefined;
      material.dispose();
    };
  }, [material]);

  useFrame((_state, delta = 0) => {
    const ringMaterial = materialRef.current;
    if (!ringMaterial?.uniforms?.uDashOffset) { return; }
    const patternSize = RING_DASH_SIZE + RING_GAP_SIZE;
    const value = ringMaterial.uniforms.uDashOffset.value as number;
    ringMaterial.uniforms.uDashOffset.value =
      (value + delta * RING_DASH_SPEED) % patternSize;
  });

  if (props.objects.length == 0) { return <></>; }
  return <Mesh
    name={"selected-object-ring"}
    geometry={geometry}
    material={material}
    frustumCulled={false} />;
};

interface SelectedObjectOverlayProps {
  object: RingObject;
  config: Config;
  showCrosshairs: boolean;
}

export const SelectedObjectOverlay = (props: SelectedObjectOverlayProps) => {
  const zero = zeroFunc(props.config);
  const extents = extentsFunc(props.config);
  const [x, y, z] = props.object.worldPosition;
  const lineZ = z + RING_Z_OFFSET;
  const ringObjects = React.useMemo(() => [props.object], [props.object]);
  return <Group name={"selected-object-overlay"}>
    <SelectedObjectRings objects={ringObjects} />
    {props.showCrosshairs &&
      <Line
        name={"selected-object-x-crosshair"}
        points={[[zero.x, y, lineZ], [extents.x, y, lineZ]]}
        color={"white"}
        transparent={true}
        opacity={0.85}
        lineWidth={1.5} />}
    {props.showCrosshairs &&
      <Line
        name={"selected-object-y-crosshair"}
        points={[[x, zero.y, lineZ], [x, extents.y, lineZ]]}
        color={"white"}
        transparent={true}
        opacity={0.85}
        lineWidth={1.5} />}
  </Group>;
};
