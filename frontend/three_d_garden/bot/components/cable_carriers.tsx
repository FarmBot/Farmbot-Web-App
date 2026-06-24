import React from "react";
import * as THREE from "three";
import { Extrude, useGLTF } from "@react-three/drei";
import { Shape } from "three";
import {
  get3DPositionNoMirrorFunc,
  zDir as zDirFunc,
  zZero as zZeroFunc,
} from "../../helpers";
import { Config, PositionConfig } from "../../config";
import type { GLTF } from "three-stdlib";
import { ASSETS, LIB_DIR, PartName } from "../../constants";
import { range } from "lodash";
import {
  Group, Mesh, MeshPhongMaterial, InstancedMesh,
} from "../../components";
import { EMISSIVE_PROPS } from "./gantry_beam";

const distinguishableBlack = "#333";

const usesV18CableCarrierSupports = (kitVersion: string): boolean =>
  ["v1.8", "v1.9"].includes(kitVersion);

type CCSupportHorizontal = GLTF & {
  nodes: { [PartName.ccSupportHorizontal]: THREE.Mesh };
  materials: never;
}
type CCSupportVertical = GLTF & {
  nodes: { [PartName.ccSupportVertical]: THREE.Mesh };
  materials: never;
}

interface CableCarrierBaseProps {
  config: Config;
  configPosition: PositionConfig;
}

type ConfigField = keyof Config;
type PositionField = keyof PositionConfig;

const positionTransformConfigFields: ConfigField[] = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
];

const cableCarrierXConfigFields: ConfigField[] = [
  "cableCarriers",
  "bedHeight",
  "botSizeX",
  "tracks",
  ...positionTransformConfigFields,
];

const cableCarrierYConfigFields: ConfigField[] = [
  "cableCarriers",
  "columnLength",
  "botSizeY",
  "kitVersion",
  ...positionTransformConfigFields,
];

const cableCarrierZConfigFields: ConfigField[] = [
  "cableCarriers",
  "botSizeZ",
  "kitVersion",
  "zGantryOffset",
  "columnLength",
  "negativeZ",
  ...positionTransformConfigFields,
];

const supportVerticalConfigFields: ConfigField[] = [
  "cableCarriers",
  "kitVersion",
  "zAxisLength",
  "columnLength",
  "zGantryOffset",
  "negativeZ",
  ...positionTransformConfigFields,
];

const supportHorizontalConfigFields: ConfigField[] = [
  "cableCarriers",
  "kitVersion",
  "botSizeY",
  "columnLength",
  ...positionTransformConfigFields,
];

const supportHorizontalV18ConfigFields: ConfigField[] = [
  ...supportHorizontalConfigFields,
  "light",
];

const sameFields = <T extends object, K extends keyof T>(
  prev: T,
  next: T,
  fields: K[],
) => fields.every(field => prev[field] === next[field]);

const sameCableCarrierProps = (
  prev: CableCarrierBaseProps,
  next: CableCarrierBaseProps,
  configFields: ConfigField[],
  positionFields: PositionField[],
) => {
  if (!prev.config.cableCarriers && !next.config.cableCarriers) {
    return true;
  }
  return sameFields(prev.config, next.config, configFields) &&
    sameFields(prev.configPosition, next.configPosition, positionFields);
};

const sameCableCarrierXProps = (
  prev: CableCarrierXProps,
  next: CableCarrierXProps,
) => sameCableCarrierProps(
  prev, next, cableCarrierXConfigFields, ["x"],
);

const sameCableCarrierYProps = (
  prev: CableCarrierYProps,
  next: CableCarrierYProps,
) => sameCableCarrierProps(
  prev, next, cableCarrierYConfigFields, ["x", "y"],
);

const sameCableCarrierZProps = (
  prev: CableCarrierZProps,
  next: CableCarrierZProps,
) => sameCableCarrierProps(
  prev, next, cableCarrierZConfigFields, ["x", "y", "z"],
);

const sameCableCarrierSupportVerticalProps = (
  prev: CableCarrierSupportVerticalProps,
  next: CableCarrierSupportVerticalProps,
) => sameCableCarrierProps(
  prev, next, supportVerticalConfigFields, ["x", "y", "z"],
);

const sameCableCarrierSupportHorizontalProps = (
  prev: CableCarrierSupportHorizontalProps,
  next: CableCarrierSupportHorizontalProps,
) => {
  const configFields =
    usesV18CableCarrierSupports(prev.config.kitVersion) ||
    usesV18CableCarrierSupports(next.config.kitVersion)
      ? supportHorizontalV18ConfigFields
      : supportHorizontalConfigFields;
  return sameCableCarrierProps(
    prev, next, configFields, ["x"],
  );
};

const ccPath =
  (axisLength: number, y: number, curveDia: number, isX?: boolean) => {
    const lowerLength = (y + axisLength + 180) / 2;
    const upperLength = lowerLength - y;
    const outerRadius = curveDia / 2;
    const height = isX ? 15 : 20;
    const innerRadius = outerRadius - height;

    const path = new Shape();
    path.moveTo(y + 20, 0);
    path.lineTo(y + upperLength, 0);
    path.arc(0, outerRadius, outerRadius, -Math.PI / 2, Math.PI / 2);
    path.lineTo(0, curveDia);
    path.lineTo(0, curveDia - 5);
    path.lineTo(20, curveDia - height);
    path.lineTo(lowerLength, curveDia - height);
    path.arc(0, -innerRadius, innerRadius, Math.PI / 2, -Math.PI / 2, true);
    if (isX) {
      path.lineTo(y + 20, height - 1);
      path.lineTo(y, 5);
      path.lineTo(y, 0);
    } else {
      path.lineTo(y, height - 1);
      path.lineTo(y, height - 5);
    }
    path.lineTo(y + 20, 0);
    return path;
  };

interface CableCarrierXProps extends CableCarrierBaseProps { }

export const CableCarrierX = React.memo((props: CableCarrierXProps) => {
  if (!props.config.cableCarriers) { return <></>; }
  return <VisibleCableCarrierX {...props} />;
}, sameCableCarrierXProps);

const VisibleCableCarrierX = (props: CableCarrierXProps) => {
  const {
    bedHeight, botSizeX, tracks, bedYOffset,
  } = props.config;
  const { x } = props.configPosition;
  const bedCCSupportHeight = Math.min(150, bedHeight / 2);
  const get3DPosition = get3DPositionNoMirrorFunc(props.config);
  const position = get3DPosition({
    x: botSizeX / 2 - 11,
    y: (tracks ? 0 : 20) - 15 - bedYOffset,
  });
  const args = React.useMemo(() => [
    ccPath(
      botSizeX / 2, botSizeX / 2 - x + 31,
      bedCCSupportHeight - 40,
      true),
    { steps: 1, depth: 22, bevelEnabled: false },
  ] as [Shape, THREE.ExtrudeGeometryOptions], [bedCCSupportHeight, botSizeX, x]);
  return <Extrude name={"xCC"}
    castShadow={true}
    args={args}
    position={[
      position.x,
      position.y,
      -40,
    ]}
    rotation={[-Math.PI / 2, -Math.PI, 0 * Math.PI]}>
    <MeshPhongMaterial color={distinguishableBlack} />
  </Extrude>;
};

interface CableCarrierYProps extends CableCarrierBaseProps { }

export const CableCarrierY = React.memo((props: CableCarrierYProps) => {
  if (!props.config.cableCarriers) { return <></>; }
  return <VisibleCableCarrierY {...props} />;
}, sameCableCarrierYProps);

const VisibleCableCarrierY = (props: CableCarrierYProps) => {
  const {
    columnLength, botSizeY, kitVersion,
  } = props.config;
  const { x, y } = props.configPosition;
  const get3DPosition = get3DPositionNoMirrorFunc(props.config);
  const ccDepth = (kitVersion: string) => {
    switch (kitVersion) {
      case "v1.7":
        return 60;
      case "v1.8":
        return 40;
      case "v1.9":
      default:
        return 30;
    }
  };
  const getPosition = (): [number, number, number] => {
    const position = get3DPosition({ x: x - 39, y: 20 });
    return [position.x, position.y, columnLength + 150];
  };
  const args = React.useMemo(() => [
    ccPath(botSizeY, y + 40, 70),
    { steps: 1, depth: ccDepth(kitVersion), bevelEnabled: false },
  ] as [Shape, THREE.ExtrudeGeometryOptions], [botSizeY, kitVersion, y]);
  return <Extrude name={"yCC"}
    castShadow={true}
    args={args}
    position={getPosition()}
    rotation={[-Math.PI / 2, -Math.PI / 2, 0]}>
    <MeshPhongMaterial color={distinguishableBlack} />
  </Extrude>;
};

interface CableCarrierZProps extends CableCarrierBaseProps { }

export const CableCarrierZ = React.memo((props: CableCarrierZProps) => {
  if (!props.config.cableCarriers) { return <></>; }
  return <VisibleCableCarrierZ {...props} />;
}, sameCableCarrierZProps);

const VisibleCableCarrierZ = (props: CableCarrierZProps) => {
  const {
    botSizeZ, kitVersion, zGantryOffset,
  } = props.config;
  const { x, y, z } = props.configPosition;
  const zZero = zZeroFunc(props.config);
  const zDir = zDirFunc(props.config);
  const get3DPosition = get3DPositionNoMirrorFunc(props.config);
  const ccDepth = (kitVersion: string) => {
    switch (kitVersion) {
      case "v1.7":
      case "v1.8":
        return 60;
      case "v1.9":
      default:
        return 30;
    }
  };
  const position = get3DPosition({ x: x - 52, y: y - ccDepth(kitVersion) + 35 });
  const args = React.useMemo(() => [
    ccPath(botSizeZ + zGantryOffset - 100, zDir * z + zGantryOffset - 15, 87),
    { steps: 1, depth: ccDepth(kitVersion), bevelEnabled: false },
  ] as [Shape, THREE.ExtrudeGeometryOptions], [
    botSizeZ,
    kitVersion,
    z,
    zDir,
    zGantryOffset,
  ]);
  return <Extrude name={"zCC"}
    castShadow={true}
    args={args}
    position={[
      position.x,
      position.y,
      zZero - zDir * z + 125,
    ]}
    rotation={[Math.PI / 2, Math.PI, Math.PI / 2]}>
    <MeshPhongMaterial color={distinguishableBlack} />
  </Extrude>;
};

export interface CableCarrierSupportVerticalProps
  extends CableCarrierBaseProps { }

export const CableCarrierSupportVertical =
  React.memo((props: CableCarrierSupportVerticalProps) => {
    if (!props.config.cableCarriers) { return <></>; }
    const width = (kitVersion: string) => {
      switch (kitVersion) {
        case "v1.8":
          return 60;
        case "v1.9":
        default:
          return 30;
      }
    };
    const extraLength = (kitVersion: string) => {
      switch (kitVersion) {
        case "v1.8":
          return 0;
        case "v1.9":
        default:
          return 225;
      }
    };
    switch (props.config.kitVersion) {
      case "v1.7":
        return <CableCarrierSupportVerticalV17 {...props} />;
      case "v1.8":
      case "v1.9":
      default:
        return <CableCarrierSupportVerticalExtruded {...props}
          width={width(props.config.kitVersion)}
          extraLength={extraLength(props.config.kitVersion)} />;
    }
  }, sameCableCarrierSupportVerticalProps);

const CableCarrierSupportVerticalV17 =
  (props: CableCarrierSupportVerticalProps) => {
    const {
      zAxisLength,
    } = props.config;
    const { x, y, z } = props.configPosition;
    const zZero = zZeroFunc(props.config);
    const zDir = zDirFunc(props.config);
    const get3DPosition = get3DPositionNoMirrorFunc(props.config);
    const ccSupportVertical =
      useGLTF(ASSETS.models.ccSupportVertical, LIB_DIR) as unknown as CCSupportVertical;
    const verticalInstances = React.useMemo(() => range((zAxisLength - 350) / 200), [zAxisLength]);
    const verticalRef = React.useRef<THREE.InstancedMesh | undefined>(undefined);
    React.useEffect(() => {
      if (!verticalRef.current || verticalInstances.length === 0) { return; }
      const temp = new THREE.Object3D();
      verticalInstances.forEach((i, index) => {
        const position = get3DPosition({ x: x + 9, y: y + 55 });
        temp.position.set(
          position.x,
          position.y,
          zZero - zDir * z + i * 200 + 125,
        );
        temp.rotation.set(0, 0, Math.PI / 2);
        temp.scale.set(1000, 1000, 1000);
        temp.updateMatrix();
        verticalRef.current?.setMatrixAt(index, temp.matrix);
      });
      verticalRef.current.instanceMatrix.needsUpdate = true;
    }, [
      verticalInstances,
      x,
      y,
      z,
      get3DPosition,
      zDir,
      zZero,
    ]);
    return <Group name={"ccSupportVertical"}>
      {verticalInstances.length > 0 &&
        <InstancedMesh
          ref={verticalRef}
          args={[
            ccSupportVertical.nodes[PartName.ccSupportVertical].geometry,
            undefined,
            verticalInstances.length,
          ]}>
          <MeshPhongMaterial color={"silver"} />
        </InstancedMesh>}
    </Group>;
  };

interface CableCarrierSupportVerticalExtrudedProps
  extends CableCarrierSupportVerticalProps {
  width: number;
  extraLength: number;
}

const CableCarrierSupportVerticalExtruded =
  (props: CableCarrierSupportVerticalExtrudedProps) => {
    const {
      zAxisLength,
    } = props.config;
    const { x, y, z } = props.configPosition;
    const zZero = zZeroFunc(props.config);
    const zDir = zDirFunc(props.config);
    const { extraLength, width } = props;
    const get3DPosition = get3DPositionNoMirrorFunc(props.config);
    const verticalGeometry = React.useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0, 20);
      shape.lineTo(15, 20);
      shape.lineTo(20, 1.5);
      shape.lineTo(28.5, 1.5);
      shape.lineTo(28.5, -width - 1);
      shape.lineTo(24, -width - 3);
      shape.lineTo(24, -width - 1.5);
      shape.lineTo(27, -width);
      shape.lineTo(27, 0);
      shape.lineTo(0, 0);
      return new THREE.ExtrudeGeometry(shape, {
        depth: zAxisLength - 350 + extraLength,
        bevelEnabled: false,
      });
    }, [extraLength, width, zAxisLength]);
    React.useEffect(() => () => verticalGeometry.dispose(), [verticalGeometry]);
    const getPosition = (): [number, number, number] => {
      const position = get3DPosition({ x: x + 9, y: y + 35 });
      return [position.x, position.y, zZero - zDir * z + 125];
    };
    return <Group name={"ccSupportVertical"}>
      <Mesh
        position={getPosition()}
        rotation={[0, 0, 0]}
        geometry={verticalGeometry}>
        <MeshPhongMaterial color={"white"}
          opacity={0.8}
          transparent={true} />
      </Mesh>
    </Group>;
  };

export interface CableCarrierSupportHorizontalProps
  extends CableCarrierBaseProps { }

export const CableCarrierSupportHorizontal =
  React.memo((props: CableCarrierSupportHorizontalProps) => {
    if (!props.config.cableCarriers) { return <></>; }
    switch (props.config.kitVersion) {
      case "v1.7":
        return <CableCarrierSupportHorizontalV17 {...props} />;
      case "v1.8":
        return <CableCarrierSupportHorizontalExtruded {...props} width={40} />;
      case "v1.9":
      default:
        return <CableCarrierSupportHorizontalExtruded {...props} width={30} />;
    }
  }, sameCableCarrierSupportHorizontalProps);

const CableCarrierSupportHorizontalV17 =
  (props: CableCarrierSupportHorizontalProps) => {
    const {
      botSizeY, columnLength,
    } = props.config;
    const { x } = props.configPosition;
    const get3DPosition = get3DPositionNoMirrorFunc(props.config);
    const ccSupportHorizontal =
      useGLTF(ASSETS.models.ccSupportHorizontal, LIB_DIR) as unknown as CCSupportHorizontal;
    const horizontalInstances = React.useMemo(() => range((botSizeY - 10) / 300), [botSizeY]);
    const horizontalRef =
      React.useRef<THREE.InstancedMesh | undefined>(undefined);
    React.useEffect(() => {
      if (!horizontalRef.current || horizontalInstances.length === 0) { return; }
      const temp = new THREE.Object3D();
      horizontalInstances.forEach((i, index) => {
        const position = get3DPosition({ x: x - 39, y: 50 + i * 300 });
        temp.position.set(
          position.x,
          position.y,
          columnLength + 60,
        );
        temp.rotation.set(Math.PI / 2, 0, 0);
        temp.scale.set(1000, 1000, 1000);
        temp.updateMatrix();
        horizontalRef.current?.setMatrixAt(index, temp.matrix);
      });
      horizontalRef.current.instanceMatrix.needsUpdate = true;
    }, [
      columnLength,
      horizontalInstances,
      x,
      get3DPosition,
    ]);
    return <Group name={"ccSupportHorizontal"}>
      {horizontalInstances.length > 0 &&
        <InstancedMesh
          ref={horizontalRef}
          args={[
            ccSupportHorizontal.nodes[PartName.ccSupportHorizontal].geometry,
            undefined,
            horizontalInstances.length,
          ]}>
          <MeshPhongMaterial color={"silver"} />
        </InstancedMesh>}
    </Group>;
  };

interface CableCarrierSupportHorizontalExtrudedProps
  extends CableCarrierSupportHorizontalProps {
  width: number;
}

const CableCarrierSupportHorizontalExtruded =
  (props: CableCarrierSupportHorizontalExtrudedProps) => {
    const {
      botSizeY, columnLength,
    } = props.config;
    const { x } = props.configPosition;
    const { width } = props;
    const get3DPosition = get3DPositionNoMirrorFunc(props.config);
    const horizontalGeometry = React.useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0, 20);
      shape.lineTo(-width, 20);
      shape.lineTo(-width - 1, 22.5);
      shape.lineTo(-width - 2.5, 22.5);
      shape.lineTo(-width - 1.5, 18.5);
      shape.lineTo(-width + 10, 18.5);
      shape.lineTo(-width + 15, 0);
      shape.lineTo(0, 0);
      return new THREE.ExtrudeGeometry(shape, {
        depth: botSizeY - 30,
        bevelEnabled: false,
      });
    }, [botSizeY, width]);
    React.useEffect(() => () => horizontalGeometry.dispose(), [horizontalGeometry]);
    const position = get3DPosition({ x: x - 39, y: 20 });
    return <Group name={"ccSupportHorizontal"}>
      <Mesh
        position={[
          position.x,
          -position.y,
          columnLength + 60,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={horizontalGeometry}>
        <MeshPhongMaterial color={"white"}
          opacity={0.8}
          {...(props.config.light ? EMISSIVE_PROPS : {})}
          transparent={true} />
      </Mesh>
    </Group>;
  };
