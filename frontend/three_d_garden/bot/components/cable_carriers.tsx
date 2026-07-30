import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
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
import { getBotVersion } from "../bot_versions";
import {
  ExtrudeGeometryArgs, millimetreGeometryKey,
  useOwnedExtrudeGeometries,
} from "./owned_extrude_geometry";
import { perfCount } from "../../../performance/perf";
import { MutableCarrierGeometry } from "./mutable_routing_geometry";
import { buildCableCarrierShape } from "./cable_carrier_geometry";

export { buildCableCarrierShape } from "./cable_carrier_geometry";

const distinguishableBlack = "#333";

interface CableCarrierMeshProps {
  cacheKey: string;
  createArgs(): ExtrudeGeometryArgs[];
  metric: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

const CableCarrierMesh = (props: CableCarrierMeshProps) => {
  const [geometry] = useOwnedExtrudeGeometries(
    props.cacheKey,
    props.createArgs,
    props.metric,
  );
  return <Mesh name={props.name}
    castShadow={true}
    geometry={geometry}
    position={props.position}
    rotation={props.rotation}>
    <MeshPhongMaterial
      color={distinguishableBlack}
      side={THREE.DoubleSide} />
  </Mesh>;
};

interface FrameCableCarrierMeshProps {
  createArgs(position: PositionConfig): ExtrudeGeometryArgs[];
  deformationKey(position: PositionConfig): string;
  initialPosition: [number, number, number];
  metric: string;
  name: string;
  position(position: PositionConfig): [number, number, number];
  positionRef: React.MutableRefObject<PositionConfig>;
  rotation: [number, number, number];
}

const buildCarrierGeometry = (
  createArgs: FrameCableCarrierMeshProps["createArgs"],
  position: PositionConfig,
) => {
  const args = requiredCarrierArgs(createArgs, position);
  return new MutableCarrierGeometry(args[0], Number(args[1].depth || 0));
};

const requiredCarrierArgs = (
  createArgs: FrameCableCarrierMeshProps["createArgs"],
  position: PositionConfig,
) => {
  const args = createArgs(position)[0];
  if (!args) { throw new Error("Cable carrier geometry is missing."); }
  return args;
};

const FrameCableCarrierMesh = (props: FrameCableCarrierMeshProps) => {
  const initialBotPosition = props.positionRef.current;
  const [initialGeometry] = React.useState(() => {
    perfCount(props.metric);
    return buildCarrierGeometry(props.createArgs, initialBotPosition);
  });
  const mesh = React.useRef<THREE.Mesh | undefined>(undefined);
  const lastDeformationKey = React.useRef(
    props.deformationKey(initialBotPosition),
  );

  useFrame(() => {
    const botPosition = props.positionRef.current;
    mesh.current?.position.set(...props.position(botPosition));
    const deformationKey = props.deformationKey(botPosition);
    if (deformationKey === lastDeformationKey.current) { return; }
    const args = requiredCarrierArgs(props.createArgs, botPosition);
    perfCount(`${props.metric}.update`);
    initialGeometry.update(args[0]);
    lastDeformationKey.current = deformationKey;
  });

  React.useLayoutEffect(() => () => {
    perfCount(`${props.metric}.dispose`);
    initialGeometry.dispose();
  }, [initialGeometry, props.metric]);

  return <Mesh ref={mesh}
    name={props.name}
    castShadow={true}
    geometry={initialGeometry}
    position={props.initialPosition}
    rotation={props.rotation}>
    <MeshPhongMaterial
      color={distinguishableBlack}
      side={THREE.DoubleSide} />
  </Mesh>;
};

const usesExtrudedCableCarrierSupports = (kitVersion: string): boolean =>
  getBotVersion(kitVersion).yCCSupport == "extrusion";

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
  local?: boolean;
  positionRef?: React.MutableRefObject<PositionConfig>;
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
    prev.positionRef === next.positionRef &&
    (!!prev.positionRef || sameFields(
      prev.configPosition,
      next.configPosition,
      positionFields,
    )) &&
    prev.local === next.local;
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
    usesExtrudedCableCarrierSupports(prev.config.kitVersion) ||
    usesExtrudedCableCarrierSupports(next.config.kitVersion)
      ? supportHorizontalV18ConfigFields
      : supportHorizontalConfigFields;
  return sameCableCarrierProps(
    prev, next, configFields, ["x"],
  );
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
  const createArgs = React.useCallback(() => [[
    buildCableCarrierShape(
      botSizeX / 2, botSizeX / 2 - x + 31,
      bedCCSupportHeight - 40,
      true,
    ),
    { steps: 1, depth: 22, bevelEnabled: false },
  ]] as ExtrudeGeometryArgs[], [
    bedCCSupportHeight,
    botSizeX,
    x,
  ]);
  const createFrameArgs = (botPosition: PositionConfig) => [[
    buildCableCarrierShape(
      botSizeX / 2,
      botSizeX / 2 - botPosition.x + 31,
      bedCCSupportHeight - 40,
      true,
    ),
    { steps: 1, depth: 22, bevelEnabled: false },
  ]] as ExtrudeGeometryArgs[];
  const renderPosition = props.local
    ? [
      botSizeX / 2 - 11,
      (tracks ? 0 : 20) - 15 - bedYOffset,
      -40,
    ] as [number, number, number]
    : [position.x, position.y, -40] as [number, number, number];
  if (props.positionRef) {
    return <FrameCableCarrierMesh key={[
      bedCCSupportHeight,
      botSizeX,
    ].join(":")}
    createArgs={createFrameArgs}
    deformationKey={botPosition => `${botPosition.x}`}
    initialPosition={renderPosition}
    metric={"bot.geometry.carrier.x"}
    name={"xCC"}
    position={() => renderPosition}
    positionRef={props.positionRef}
    rotation={[-Math.PI / 2, -Math.PI, 0 * Math.PI]} />;
  }
  return <CableCarrierMesh name={"xCC"}
    cacheKey={millimetreGeometryKey([
      bedCCSupportHeight, botSizeX,
    ].join(":"), x)}
    createArgs={createArgs}
    metric={"bot.geometry.carrier.x"}
    position={renderPosition}
    rotation={[-Math.PI / 2, -Math.PI, 0 * Math.PI]} />;
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
  const ccDepth = getBotVersion(kitVersion).yCCDepth;
  const getPosition = (): [number, number, number] => {
    const position = get3DPosition({ x: x - 39, y: 20 });
    return props.local
      ? [x - 39, 20, columnLength + 150]
      : [position.x, position.y, columnLength + 150];
  };
  const getFramePosition = (
    botPosition: PositionConfig,
  ): [number, number, number] => {
    const position = get3DPosition({ x: botPosition.x - 39, y: 20 });
    return props.local
      ? [botPosition.x - 39, 20, columnLength + 150]
      : [position.x, position.y, columnLength + 150];
  };
  const createArgs = React.useCallback(() => [[
    buildCableCarrierShape(botSizeY, y + 40, 70),
    { steps: 1, depth: ccDepth, bevelEnabled: false },
  ]] as ExtrudeGeometryArgs[], [botSizeY, ccDepth, y]);
  const createFrameArgs = (botPosition: PositionConfig) => [[
    buildCableCarrierShape(botSizeY, botPosition.y + 40, 70),
    { steps: 1, depth: ccDepth, bevelEnabled: false },
  ]] as ExtrudeGeometryArgs[];
  if (props.positionRef) {
    return <FrameCableCarrierMesh key={[
      botSizeY,
      ccDepth,
      columnLength,
    ].join(":")}
    createArgs={createFrameArgs}
    deformationKey={botPosition => `${botPosition.y}`}
    initialPosition={getFramePosition(props.positionRef.current)}
    metric={"bot.geometry.carrier.y"}
    name={"yCC"}
    position={getFramePosition}
    positionRef={props.positionRef}
    rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />;
  }
  return <CableCarrierMesh name={"yCC"}
    cacheKey={millimetreGeometryKey([
      botSizeY, ccDepth,
    ].join(":"), y)}
    createArgs={createArgs}
    metric={"bot.geometry.carrier.y"}
    position={getPosition()}
    rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />;
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
  const ccDepth = getBotVersion(kitVersion).zCCDepth;
  const position = get3DPosition({ x: x - 52, y: y - ccDepth + 35 });
  const createArgs = React.useCallback(() => [[
    buildCableCarrierShape(
      botSizeZ + zGantryOffset - 100,
      zDir * z + zGantryOffset - 15,
      87,
    ),
    { steps: 1, depth: ccDepth, bevelEnabled: false },
  ]] as ExtrudeGeometryArgs[], [
    botSizeZ,
    ccDepth,
    z,
    zDir,
    zGantryOffset,
  ]);
  const createFrameArgs = (botPosition: PositionConfig) => [[
    buildCableCarrierShape(
      botSizeZ + zGantryOffset - 100,
      zDir * botPosition.z + zGantryOffset - 15,
      87,
    ),
    { steps: 1, depth: ccDepth, bevelEnabled: false },
  ]] as ExtrudeGeometryArgs[];
  const getFramePosition = (
    botPosition: PositionConfig,
  ): [number, number, number] => {
    const position = get3DPosition({
      x: botPosition.x - 52,
      y: botPosition.y - ccDepth + 35,
    });
    return props.local
      ? [
        botPosition.x - 52,
        botPosition.y - ccDepth + 35,
        zZero - zDir * botPosition.z + 125,
      ]
      : [
        position.x,
        position.y,
        zZero - zDir * botPosition.z + 125,
      ];
  };
  if (props.positionRef) {
    return <FrameCableCarrierMesh key={[
      botSizeZ,
      ccDepth,
      zDir,
      zGantryOffset,
    ].join(":")}
    createArgs={createFrameArgs}
    deformationKey={botPosition => `${botPosition.z}`}
    initialPosition={getFramePosition(props.positionRef.current)}
    metric={"bot.geometry.carrier.z"}
    name={"zCC"}
    position={getFramePosition}
    positionRef={props.positionRef}
    rotation={[Math.PI / 2, Math.PI, Math.PI / 2]} />;
  }
  return <CableCarrierMesh name={"zCC"}
    cacheKey={millimetreGeometryKey([
      botSizeZ, ccDepth, zDir, zGantryOffset,
    ].join(":"), z)}
    createArgs={createArgs}
    metric={"bot.geometry.carrier.z"}
    position={props.local
      ? [x - 52, y - ccDepth + 35, zZero - zDir * z + 125]
      : [position.x, position.y, zZero - zDir * z + 125]}
    rotation={[Math.PI / 2, Math.PI, Math.PI / 2]} />;
};

export interface CableCarrierSupportVerticalProps
  extends CableCarrierBaseProps { }

export const CableCarrierSupportVertical =
  React.memo((props: CableCarrierSupportVerticalProps) => {
    if (!props.config.cableCarriers) { return <></>; }
    const version = getBotVersion(props.config.kitVersion);
    switch (version.yCCSupport) {
      case "models":
        return <CableCarrierSupportVerticalV17 {...props} />;
      case "extrusion":
        return <CableCarrierSupportVerticalExtruded {...props}
          width={version.verticalCCSupportWidth}
          extraLength={version.verticalCCExtraLength} />;
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
        const position = props.local
          ? { x: 9, y: 55 }
          : get3DPosition({ x: x + 9, y: y + 55 });
        temp.position.set(
          position.x,
          position.y,
          props.local ? i * 200 + 125 : zZero - zDir * z + i * 200 + 125,
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
      props.local,
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
      const position = props.local
        ? { x: 9, y: 35 }
        : get3DPosition({ x: x + 9, y: y + 35 });
      return [
        position.x,
        position.y,
        props.local ? 125 : zZero - zDir * z + 125,
      ];
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
    const version = getBotVersion(props.config.kitVersion);
    switch (version.yCCSupport) {
      case "models":
        return <CableCarrierSupportHorizontalV17 {...props} />;
      case "extrusion":
        return <CableCarrierSupportHorizontalExtruded {...props}
          width={version.horizontalCCSupportWidth} />;
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
        const position = props.local
          ? { x: -39, y: 50 + i * 300 }
          : get3DPosition({ x: x - 39, y: 50 + i * 300 });
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
      props.local,
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
    const origin = get3DPosition({ x: 0, y: 0 });
    return <Group name={"ccSupportHorizontal"}>
      <Mesh
        position={props.local
          ? [-39, -position.y - origin.y, columnLength + 60]
          : [position.x, -position.y, columnLength + 60]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={horizontalGeometry}>
        <MeshPhongMaterial color={"white"}
          opacity={0.8}
          {...(props.config.light ? EMISSIVE_PROPS : {})}
          transparent={true} />
      </Mesh>
    </Group>;
  };
