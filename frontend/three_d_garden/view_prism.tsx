import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import { CanvasTexture } from "three";
import { useControlCursor } from "./controls";

export type ViewPrismDirection = [number, number, number];

export const VIEW_PRISM_DIMENSIONS: ViewPrismDirection = [1.6, 1, 0.6];
export const VIEW_PRISM_SCALE = 48;
export const VIEW_PRISM_BOUNDING_BOX_HALF_SIZE = Math.hypot(
  VIEW_PRISM_DIMENSIONS[0] / 2,
  VIEW_PRISM_DIMENSIONS[1] / 2,
  VIEW_PRISM_DIMENSIONS[2] / 2,
) * VIEW_PRISM_SCALE;
export const VIEW_PRISM_TOP_CENTER: ViewPrismDirection = [
  0,
  0,
  VIEW_PRISM_DIMENSIONS[2] / 2 * VIEW_PRISM_SCALE,
];
export const VIEW_PRISM_TOP_CENTER_BOUNDING_RADIUS = Math.hypot(
  VIEW_PRISM_DIMENSIONS[0] / 2,
  VIEW_PRISM_DIMENSIONS[1] / 2,
  VIEW_PRISM_DIMENSIONS[2],
) * VIEW_PRISM_SCALE;

type ViewPrismTargetKind = "face" | "edge" | "corner";

export interface ViewPrismTarget {
  id: string;
  kind: ViewPrismTargetKind;
  direction: ViewPrismDirection;
  position: ViewPrismDirection;
  scale: ViewPrismDirection;
}

const TARGET_BAND = 0.25;
const TARGET_DEPTH = 0.06;
const TARGET_SURFACE_OFFSET = 0.005;
const TOP_TARGET_DEPTH = TARGET_BAND;
const CORNER_TARGET_SIZE = TARGET_BAND;
const X_HALF = VIEW_PRISM_DIMENSIONS[0] / 2;
const Y_HALF = VIEW_PRISM_DIMENSIONS[1] / 2;
const Z_HALF = VIEW_PRISM_DIMENSIONS[2] / 2;
const TOP_TARGET_Z = Z_HALF - TOP_TARGET_DEPTH / 2
  + TARGET_SURFACE_OFFSET;
const TOP_TARGET_BOTTOM = TOP_TARGET_Z - TOP_TARGET_DEPTH / 2;
const SIDE_TARGET_HEIGHT = TOP_TARGET_BOTTOM + Z_HALF;
const SIDE_TARGET_Z = (TOP_TARGET_BOTTOM - Z_HALF) / 2;
const X_FACE_POSITION = X_HALF - TARGET_DEPTH / 2
  + TARGET_SURFACE_OFFSET;
const Y_FACE_POSITION = Y_HALF - TARGET_DEPTH / 2
  + TARGET_SURFACE_OFFSET;
const X_EDGE_POSITION = X_HALF - TARGET_BAND / 2
  + TARGET_SURFACE_OFFSET;
const Y_EDGE_POSITION = Y_HALF - TARGET_BAND / 2
  + TARGET_SURFACE_OFFSET;
const X_CORNER_POSITION = X_HALF - CORNER_TARGET_SIZE / 2
  + TARGET_SURFACE_OFFSET;
const Y_CORNER_POSITION = Y_HALF - CORNER_TARGET_SIZE / 2
  + TARGET_SURFACE_OFFSET;
const CORNER_TARGET_Z = Z_HALF - CORNER_TARGET_SIZE / 2
  + TARGET_SURFACE_OFFSET;
const X_FACE_LENGTH = VIEW_PRISM_DIMENSIONS[1]
  + 2 * TARGET_SURFACE_OFFSET - 2 * TARGET_BAND;
const Y_FACE_LENGTH = VIEW_PRISM_DIMENSIONS[0]
  + 2 * TARGET_SURFACE_OFFSET - 2 * TARGET_BAND;

export const VIEW_PRISM_TARGETS: ViewPrismTarget[] = [
  {
    id: "face-top",
    kind: "face",
    direction: [0, 0, 1],
    position: [0, 0, TOP_TARGET_Z],
    scale: [Y_FACE_LENGTH, X_FACE_LENGTH, TOP_TARGET_DEPTH],
  },
  {
    id: "face-positive-x",
    kind: "face",
    direction: [1, 0, 0],
    position: [X_FACE_POSITION, 0, SIDE_TARGET_Z],
    scale: [TARGET_DEPTH, X_FACE_LENGTH, SIDE_TARGET_HEIGHT],
  },
  {
    id: "face-negative-x",
    kind: "face",
    direction: [-1, 0, 0],
    position: [-X_FACE_POSITION, 0, SIDE_TARGET_Z],
    scale: [TARGET_DEPTH, X_FACE_LENGTH, SIDE_TARGET_HEIGHT],
  },
  {
    id: "face-positive-y",
    kind: "face",
    direction: [0, 1, 0],
    position: [0, Y_FACE_POSITION, SIDE_TARGET_Z],
    scale: [Y_FACE_LENGTH, TARGET_DEPTH, SIDE_TARGET_HEIGHT],
  },
  {
    id: "face-negative-y",
    kind: "face",
    direction: [0, -1, 0],
    position: [0, -Y_FACE_POSITION, SIDE_TARGET_Z],
    scale: [Y_FACE_LENGTH, TARGET_DEPTH, SIDE_TARGET_HEIGHT],
  },
  {
    id: "edge-top-positive-x",
    kind: "edge",
    direction: [1, 0, 1],
    position: [X_EDGE_POSITION, 0, TOP_TARGET_Z],
    scale: [TARGET_BAND, X_FACE_LENGTH, TOP_TARGET_DEPTH],
  },
  {
    id: "edge-top-negative-x",
    kind: "edge",
    direction: [-1, 0, 1],
    position: [-X_EDGE_POSITION, 0, TOP_TARGET_Z],
    scale: [TARGET_BAND, X_FACE_LENGTH, TOP_TARGET_DEPTH],
  },
  {
    id: "edge-top-positive-y",
    kind: "edge",
    direction: [0, 1, 1],
    position: [0, Y_EDGE_POSITION, TOP_TARGET_Z],
    scale: [Y_FACE_LENGTH, TARGET_BAND, TOP_TARGET_DEPTH],
  },
  {
    id: "edge-top-negative-y",
    kind: "edge",
    direction: [0, -1, 1],
    position: [0, -Y_EDGE_POSITION, TOP_TARGET_Z],
    scale: [Y_FACE_LENGTH, TARGET_BAND, TOP_TARGET_DEPTH],
  },
  {
    id: "corner-top-positive-x-positive-y",
    kind: "corner",
    direction: [1, 1, 1],
    position: [X_CORNER_POSITION, Y_CORNER_POSITION, CORNER_TARGET_Z],
    scale: [CORNER_TARGET_SIZE, CORNER_TARGET_SIZE, CORNER_TARGET_SIZE],
  },
  {
    id: "corner-top-positive-x-negative-y",
    kind: "corner",
    direction: [1, -1, 1],
    position: [X_CORNER_POSITION, -Y_CORNER_POSITION, CORNER_TARGET_Z],
    scale: [CORNER_TARGET_SIZE, CORNER_TARGET_SIZE, CORNER_TARGET_SIZE],
  },
  {
    id: "corner-top-negative-x-positive-y",
    kind: "corner",
    direction: [-1, 1, 1],
    position: [-X_CORNER_POSITION, Y_CORNER_POSITION, CORNER_TARGET_Z],
    scale: [CORNER_TARGET_SIZE, CORNER_TARGET_SIZE, CORNER_TARGET_SIZE],
  },
  {
    id: "corner-top-negative-x-negative-y",
    kind: "corner",
    direction: [-1, -1, 1],
    position: [-X_CORNER_POSITION, -Y_CORNER_POSITION, CORNER_TARGET_Z],
    scale: [CORNER_TARGET_SIZE, CORNER_TARGET_SIZE, CORNER_TARGET_SIZE],
  },
  {
    id: "edge-side-positive-x-positive-y",
    kind: "edge",
    direction: [1, 1, 0],
    position: [X_EDGE_POSITION, Y_EDGE_POSITION, SIDE_TARGET_Z],
    scale: [TARGET_BAND, TARGET_BAND, SIDE_TARGET_HEIGHT],
  },
  {
    id: "edge-side-positive-x-negative-y",
    kind: "edge",
    direction: [1, -1, 0],
    position: [X_EDGE_POSITION, -Y_EDGE_POSITION, SIDE_TARGET_Z],
    scale: [TARGET_BAND, TARGET_BAND, SIDE_TARGET_HEIGHT],
  },
  {
    id: "edge-side-negative-x-positive-y",
    kind: "edge",
    direction: [-1, 1, 0],
    position: [-X_EDGE_POSITION, Y_EDGE_POSITION, SIDE_TARGET_Z],
    scale: [TARGET_BAND, TARGET_BAND, SIDE_TARGET_HEIGHT],
  },
  {
    id: "edge-side-negative-x-negative-y",
    kind: "edge",
    direction: [-1, -1, 0],
    position: [-X_EDGE_POSITION, -Y_EDGE_POSITION, SIDE_TARGET_Z],
    scale: [TARGET_BAND, TARGET_BAND, SIDE_TARGET_HEIGHT],
  },
];

export const VIEW_PRISM_LABEL_ROTATIONS: Record<string, number> = {
  "+X": -Math.PI / 2,
  "-X": Math.PI / 2,
  "+Y": Math.PI,
  "-Y": 0,
  TOP: 0,
};

interface FaceDefinition {
  label: string;
  width: number;
  height: number;
}

const FACE_DEFINITIONS: FaceDefinition[] = [
  {
    label: "+X",
    width: VIEW_PRISM_DIMENSIONS[2],
    height: VIEW_PRISM_DIMENSIONS[1],
  },
  {
    label: "-X",
    width: VIEW_PRISM_DIMENSIONS[2],
    height: VIEW_PRISM_DIMENSIONS[1],
  },
  {
    label: "+Y",
    width: VIEW_PRISM_DIMENSIONS[0],
    height: VIEW_PRISM_DIMENSIONS[2],
  },
  {
    label: "-Y",
    width: VIEW_PRISM_DIMENSIONS[0],
    height: VIEW_PRISM_DIMENSIONS[2],
  },
  {
    label: "TOP",
    width: VIEW_PRISM_DIMENSIONS[0],
    height: VIEW_PRISM_DIMENSIONS[1],
  },
  {
    label: "",
    width: VIEW_PRISM_DIMENSIONS[0],
    height: VIEW_PRISM_DIMENSIONS[1],
  },
];

export interface ViewPrismColors {
  color: string;
  hoverColor: string;
  textColor: string;
  strokeColor: string;
}

interface ViewPrismProps extends ViewPrismColors {
  onDirection(direction: ViewPrismDirection): void;
  borderWidth?: number;
}

const BASE_FACE_TEXTURE_RESOLUTION = 128;
export const VIEW_PRISM_FACE_TEXTURE_RESOLUTION =
  BASE_FACE_TEXTURE_RESOLUTION * 4;
export const VIEW_PRISM_TEXTURE_ANISOTROPY = 4;

const makeFaceTexture = (
  face: FaceDefinition,
  colors: ViewPrismColors,
  borderWidth: number,
) => {
  const textureScale = VIEW_PRISM_FACE_TEXTURE_RESOLUTION
    / BASE_FACE_TEXTURE_RESOLUTION;
  const minimumFaceDimension = Math.min(face.width, face.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(
    face.width / minimumFaceDimension * VIEW_PRISM_FACE_TEXTURE_RESOLUTION,
  );
  canvas.height = Math.round(
    face.height / minimumFaceDimension * VIEW_PRISM_FACE_TEXTURE_RESOLUTION,
  );
  const context = canvas.getContext("2d");
  if (context) {
    const scaledBorderWidth = borderWidth * textureScale;
    context.fillStyle = colors.color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = scaledBorderWidth;
    context.strokeStyle = colors.strokeColor;
    context.strokeRect(
      scaledBorderWidth / 2,
      scaledBorderWidth / 2,
      canvas.width - scaledBorderWidth,
      canvas.height - scaledBorderWidth,
    );
    if (face.label) {
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(VIEW_PRISM_LABEL_ROTATIONS[face.label] ?? 0);
      context.fillStyle = colors.textColor;
      context.font = [
        `bold ${48 * textureScale}px`,
        "Inter var, Arial, sans-serif",
      ].join(" ");
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(
        face.label,
        0,
        0,
        Math.max(canvas.width, canvas.height) - 24 * textureScale,
      );
      context.restore();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.anisotropy = VIEW_PRISM_TEXTURE_ANISOTROPY;
  return texture;
};

interface ViewPrismTargetMeshProps {
  target: ViewPrismTarget;
  hoverColor: string;
  onDirection(direction: ViewPrismDirection): void;
}

const ViewPrismTargetMesh = (props: ViewPrismTargetMeshProps) => {
  const [hovered, setHovered] = React.useState(false);
  useControlCursor(hovered, "pointer");
  const stopAndSetHover = (
    hoveredState: boolean,
    event: ThreeEvent<PointerEvent>,
  ) => {
    event.stopPropagation();
    setHovered(hoveredState);
  };
  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    props.onDirection(props.target.direction);
  };
  return <mesh
    name={`view-prism-target-${props.target.id}`}
    userData={{
      viewPrismTarget: true,
      kind: props.target.kind,
      direction: props.target.direction,
    }}
    position={props.target.position}
    scale={props.target.scale}
    onPointerOver={event => stopAndSetHover(true, event)}
    onPointerOut={event => stopAndSetHover(false, event)}
    onClick={click}>
    <boxGeometry />
    <meshBasicMaterial
      color={props.hoverColor}
      transparent={true}
      opacity={hovered ? 0.75 : 0}
      depthWrite={false} />
  </mesh>;
};

export const ViewPrism = (props: ViewPrismProps) => {
  const borderWidth = props.borderWidth ?? 6;
  const colors = React.useMemo(() => ({
    color: props.color,
    hoverColor: props.hoverColor,
    textColor: props.textColor,
    strokeColor: props.strokeColor,
  }), [props.color, props.hoverColor, props.textColor, props.strokeColor]);
  const textures = React.useMemo(() => FACE_DEFINITIONS.map(face =>
    makeFaceTexture(face, colors, borderWidth)), [borderWidth, colors]);
  React.useEffect(() => () => {
    textures.forEach(texture => texture.dispose());
  }, [textures]);
  return <group
    name={"view-prism-bounds"}
    scale={VIEW_PRISM_SCALE}>
    <mesh
      name={"view-prism-body"}
      userData={{ dimensions: VIEW_PRISM_DIMENSIONS }}>
      {textures.map((texture, index) =>
        <meshBasicMaterial
          attach={`material-${index}`}
          key={FACE_DEFINITIONS[index].label || "bottom"}
          map={texture} />)}
      <boxGeometry args={VIEW_PRISM_DIMENSIONS} />
    </mesh>
    {VIEW_PRISM_TARGETS.map(target =>
      <ViewPrismTargetMesh
        key={target.id}
        target={target}
        hoverColor={props.hoverColor}
        onDirection={props.onDirection} />)}
  </group>;
};
