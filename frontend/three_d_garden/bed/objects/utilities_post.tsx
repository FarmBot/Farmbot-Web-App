import React from "react";
import { animated, useSpring } from "@react-spring/three";
import { to } from "@react-spring/core";
import { Box, RoundedBox } from "@react-three/drei";
import { RepeatWrapping } from "three";
import { ASSETS } from "../../constants";
import { Config } from "../../config";
import {
  threeSpace, getColorFromBrightness, easyCubicBezierCurve3,
} from "../../helpers";
import { outletDepth } from "../../bot";
import * as THREE from "three";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { useFocusTransition } from "../../focus_transition";
import { useTextureVariant } from "../../texture_variants";
import {
  mergeSolidGeometries,
  SolidGeometryPart,
} from "../../geometry_batching";

const AnimatedGroup = animated(Group);
const UTILITIES_POST_FOCUS_DEPTH_SCALE = 1.5;
const utilitiesPostFocusSpringConfig = {
  tension: 240,
  friction: 30,
};

export interface UtilitiesPostProps {
  config: Config;
  activeFocus: string;
}

type Vector3 = [number, number, number];

interface UtilitiesPostGeometryProps {
  hosePathCurved: THREE.Curve<THREE.Vector3>;
  hosePathStraight: THREE.Curve<THREE.Vector3>;
  legSize: number;
}

export const makeUtilitiesPostGeometry = (
  props: UtilitiesPostGeometryProps,
) => {
  const { hosePathCurved, hosePathStraight, legSize } = props;
  const handlePosition: Vector3 = [0, -legSize / 2 - 65, 105];
  const handleRotation: Vector3 = [-Math.PI / 4, 0, 0];
  const parts: SolidGeometryPart[] = [
    {
      geometry: new THREE.CylinderGeometry(
        outletDepth / 2, outletDepth / 2, 200,
      ),
      color: "gray",
      position: [-legSize / 2 - outletDepth / 2, 0, -50],
      rotation: [Math.PI / 2, 0, 0],
    },
    ...[-30, 30].map((x, index): SolidGeometryPart => ({
      geometry: new THREE.CylinderGeometry(3.5, 3.5, 60),
      color: "gray",
      position: [x, 0, 200],
      rotation: [Math.PI / 2, 0, index == 0 ? Math.PI / 8 : -Math.PI / 8],
    })),
    ...[
      { color: "green", x: -40 },
      { color: "blue", x: -30 },
    ].map(({ color, x }): SolidGeometryPart => ({
      geometry: new THREE.CylinderGeometry(2, 2, 61),
      color,
      position: [x, 0, 170],
    })),
    {
      geometry: new THREE.CylinderGeometry(18, 18, 200),
      color: "#f4f4f4",
      position: [0, -legSize / 2 - 20, -50],
      rotation: [Math.PI / 2, 0, 0],
    },
    {
      geometry: new THREE.CylinderGeometry(20, 20, 80),
      color: "gold",
      position: [0, -legSize / 2 - 20, 90],
      rotation: [Math.PI / 2, 0, 0],
    },
    {
      geometry: new THREE.CylinderGeometry(18, 18, 70),
      color: "gold",
      position: [0, -legSize / 2 - 45, 90],
      rotation: [Math.PI / 4, 0, 0],
    },
    {
      geometry: new THREE.CylinderGeometry(25, 25, 10),
      color: "#0266b5",
      position: handlePosition,
      rotation: handleRotation,
    },
    {
      geometry: new THREE.CylinderGeometry(4, 4, 15),
      color: "#434343",
      position: handlePosition,
      rotation: handleRotation,
    },
    {
      geometry: new THREE.TubeGeometry(hosePathCurved, 10, 15, 8),
      color: "darkgreen",
    },
    {
      geometry: new THREE.TubeGeometry(hosePathStraight, 1, 15, 8),
      color: "darkgreen",
    },
  ];
  const geometry = mergeSolidGeometries(parts);
  parts.forEach(part => part.geometry?.dispose());
  return geometry;
};

interface UtilitiesPostFocusGroupProps
  extends Omit<React.ComponentProps<typeof Group>, "position" | "visible"> {
  hiddenDepthOffset: number;
  shownPosition: Vector3;
  visible: boolean;
}

const UtilitiesPostFocusGroup = (props: UtilitiesPostFocusGroupProps) => {
  const {
    hiddenDepthOffset, shownPosition, visible, children, ...groupProps
  } = props;
  const transition = useFocusTransition();
  const [groupVisible, setGroupVisible] = React.useState(visible);
  const [{ focusDepthOffset }, api] = useSpring(() => ({
    focusDepthOffset: visible ? 0 : hiddenDepthOffset,
    immediate: !transition.enabled,
    config: utilitiesPostFocusSpringConfig,
  }));

  React.useEffect(() => {
    api.start({
      focusDepthOffset: visible ? 0 : hiddenDepthOffset,
      immediate: !transition.enabled,
      config: utilitiesPostFocusSpringConfig,
      onRest: () => {
        if (transition.enabled) {
          setGroupVisible(visible);
        }
      },
    });
  }, [api, hiddenDepthOffset, transition.enabled, visible]);

  React.useEffect(() => {
    if (!transition.enabled || !visible) { return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGroupVisible(true);
  }, [transition.enabled, visible]);

  const focusPosition = to(focusDepthOffset,
    depth => [0, 0, depth] as Vector3);

  return <Group {...groupProps}
    visible={transition.enabled ? visible || groupVisible : visible}
    position={shownPosition}>
    <AnimatedGroup position={focusPosition}>
      {children}
    </AnimatedGroup>
  </Group>;
};

const UTILITIES_POST_CONFIG_FIELDS: (keyof Config)[] = [
  "bedBrightness",
  "bedHeight",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedZOffset",
  "legSize",
  "utilitiesPost",
];

export const utilitiesPostPropsEqual = (
  prev: UtilitiesPostProps,
  next: UtilitiesPostProps,
) =>
  prev.activeFocus === next.activeFocus &&
  UTILITIES_POST_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

const UtilitiesPostBase = (props: UtilitiesPostProps) => {
  if (!props.config.utilitiesPost) { return <></>; }

  return <EnabledUtilitiesPost {...props} />;
};

const EnabledUtilitiesPost = (props: UtilitiesPostProps) => {
  const {
    legSize, bedLengthOuter, bedWidthOuter,
    bedBrightness, bedHeight, bedZOffset,
  } = props.config;
  const groundZ = -bedHeight - bedZOffset;
  const postColor = getColorFromBrightness(bedBrightness);
  const faucetX = 0;
  const faucetY = -115;
  const faucetZ = 70;
  const barbX = -bedLengthOuter / 2 - 200;
  const barbY = -100;
  const barbZ = -130;

  const { hosePathCurved, hosePathStraight } = React.useMemo(() => ({
    hosePathCurved: easyCubicBezierCurve3(
      [faucetX, faucetY, faucetZ],
      [0, -60, -65],
      [200, 0, 0],
      [faucetX - 205, barbY, barbZ],
    ),
    hosePathStraight: new THREE.LineCurve3(
      new THREE.Vector3(faucetX - 200, barbY, barbZ),
      new THREE.Vector3(barbX, barbY, barbZ),
    ),
  }), [barbX, barbY, barbZ, faucetX, faucetY, faucetZ]);

  const postWoodTexture = useTextureVariant(ASSETS.textures.wood, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.02, 0.05],
  });
  const shownPosition = React.useMemo<Vector3>(() => [
    threeSpace(bedLengthOuter + 600, bedLengthOuter),
    threeSpace(legSize / 2, bedWidthOuter),
    groundZ + 150,
  ], [bedLengthOuter, bedWidthOuter, groundZ, legSize]);
  const hiddenDepthOffset =
    -(bedHeight + bedZOffset) * UTILITIES_POST_FOCUS_DEPTH_SCALE;
  const solidGeometry = React.useMemo(() => makeUtilitiesPostGeometry({
    hosePathCurved,
    hosePathStraight,
    legSize,
  }), [hosePathCurved, hosePathStraight, legSize]);
  React.useEffect(() => () => solidGeometry?.dispose(), [solidGeometry]);

  return <UtilitiesPostFocusGroup name={"utilities"}
    visible={props.activeFocus != "Planter bed"}
    shownPosition={shownPosition}
    hiddenDepthOffset={hiddenDepthOffset}>
    <Box name={"utilities-post"}
      castShadow={true}
      args={[legSize, legSize, 300]}>
      <MeshPhongMaterial map={postWoodTexture} color={postColor} />
    </Box>
    <Box name={"electrical-outlet"}
      castShadow={true}
      args={[outletDepth, 75, 110]}
      position={[-legSize / 2 - outletDepth / 2, 0, 85]}>
      <MeshPhongMaterial color={"gray"} />
    </Box>
    <Group name={"wifi-router"}
      position={[0, 0, 165]}>
      <RoundedBox name={"router-base"}
        castShadow={true}
        receiveShadow={true}
        radius={8}
        args={[legSize, 60, 30]}>
        <MeshPhongMaterial color={"lightgray"} />
      </RoundedBox>
    </Group>
    <Mesh name={"utilities-solid-hardware"}
      castShadow={true}
      receiveShadow={true}
      geometry={solidGeometry}>
      <MeshPhongMaterial color={"white"} vertexColors={true} />
    </Mesh>
  </UtilitiesPostFocusGroup>;
};

export const UtilitiesPost = React.memo(
  UtilitiesPostBase,
  utilitiesPostPropsEqual,
);
