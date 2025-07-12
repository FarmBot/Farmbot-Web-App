import {
  ASSETS,
  ElectronicsBoxMaterial,
  PartName,
  SeedTroughAssemblyMaterial,
  SeedTroughHolderMaterial,
  VacuumPumpCoverMaterial,
} from "../three_d_garden/constants";
import * as THREE from "three";
import React, { ReactNode } from "react";
import { TransitionFn, UseSpringProps } from "@react-spring/three";
import { ThreeElements, ThreeEvent } from "@react-three/fiber";
import { Cloud, Clouds, Image, Plane, Trail, Tube } from "@react-three/drei";

const GroupForTests = (props: ThreeElements["group"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <group {...props} />;

type Event = ThreeEvent<PointerEvent>;

const MeshForTests = (props: ThreeElements["mesh"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <mesh {...props}
    onPointerMove={(e: Event) =>
      props.onPointerMove?.({
        // @ts-expect-error: This spread always overwrites this property.
        point: { x: 0, y: 0 },
        ...e,
      })}
    onClick={(e: Event) =>
      props.onClick?.({
        // @ts-expect-error: This spread always overwrites this property.
        stopPropagation: jest.fn(),
        // @ts-expect-error: This spread always overwrites this property.
        point: { x: 0, y: 0 },
        ...e,
      } as unknown as Event)}>
    {props.name}
    {props.children}
    {/* @ts-expect-error Property does not exist on type JSX.IntrinsicElements */}
  </mesh>;

jest.mock("../three_d_garden/components", () => ({
  ...jest.requireActual("../three_d_garden/components"),
  Mesh: (props: ThreeElements["mesh"]) => <MeshForTests {...props} />,
  Group: (props: ThreeElements["group"]) =>
    props.visible === false
      ? <></>
      : <GroupForTests {...props} />,
}));

jest.mock("three/examples/jsm/Addons.js", () => ({
  SVGLoader: class {
    static createShapes: unknown = jest.fn(() => [{ holes: { push: jest.fn() } }]);
    load = jest.fn((_, fn) => fn({ paths: [[0], [1], [2], [3], [4]] }));
  }
}));

jest.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  addEffect: jest.fn(),
  useFrame: jest.fn(x => x({ clock: { getElapsedTime: jest.fn(() => 0) } })),
  useThree: jest.fn(() => ({
    pointer: { x: 0, y: 0 },
    camera: new THREE.PerspectiveCamera(),
  })),
}));

jest.mock("@react-spring/three", () => ({
  useSpring: (props: UseSpringProps) => {
    const next = jest.fn();
    (props.to as TransitionFn)?.(next);
    return { ...props, ...props.from };
  },
  // mocks for `<animated.mesh...` and similar:
  //   animated: {
  //     mesh: ({ children }: { children: ReactNode }) =>
  //       <div className={"animated"}>{children}</div>,
  //     meshPhongMaterial: () => <div />,
  //     group: ({ children }: { children: ReactNode }) =>
  //       <div className={"group"}>{children}</div>,
  //     pointLight: () => <div />,
  //   },
  // mocks for `const AnimatedMesh = animated(Mesh); ... <AnimatedMesh...`:
  animated: () => ({ children }: { children?: ReactNode }) =>
    <div className={"animated"}>{children}</div>,
}));

jest.mock("@react-three/drei", () => {
  const useGLTF = jest.fn((key: string) => ({
    [ASSETS.models.crossSlide]: {
      nodes: {
        Cable_Carrier_Spacer_Block: {} as THREE.Mesh,
        mesh0_mesh: {} as THREE.Mesh,
        mesh0_mesh_1: {} as THREE.Mesh,
        mesh0_mesh_2: {} as THREE.Mesh,
        mesh0_mesh_3: {} as THREE.Mesh,
        mesh0_mesh_4: {} as THREE.Mesh,
        mesh0_mesh_5: {} as THREE.Mesh,
        mesh0_mesh_6: {} as THREE.Mesh,
        mesh0_mesh_7: {} as THREE.Mesh,
        mesh0_mesh_8: {} as THREE.Mesh,
        mesh0_mesh_9: {} as THREE.Mesh,
        mesh0_mesh_10: {} as THREE.Mesh,
        mesh0_mesh_11: {} as THREE.Mesh,
        mesh0_mesh_12: {} as THREE.Mesh,
        mesh0_mesh_13: {} as THREE.Mesh,
        mesh0_mesh_14: {} as THREE.Mesh,
        mesh0_mesh_15: {} as THREE.Mesh,
        mesh0_mesh_16: {} as THREE.Mesh,
        mesh0_mesh_17: {} as THREE.Mesh,
        mesh0_mesh_18: {} as THREE.Mesh,
        mesh0_mesh_19: {} as THREE.Mesh,
        mesh0_mesh_20: {} as THREE.Mesh,
        mesh0_mesh_21: {} as THREE.Mesh,
        mesh0_mesh_22: {} as THREE.Mesh,
        mesh0_mesh_23: {} as THREE.Mesh,
        mesh0_mesh_24: {} as THREE.Mesh,
        mesh0_mesh_25: {} as THREE.Mesh,
        mesh0_mesh_26: {} as THREE.Mesh,
        mesh0_mesh_27: {} as THREE.Mesh,
        mesh0_mesh_28: {} as THREE.Mesh,
        mesh0_mesh_29: {} as THREE.Mesh,
        mesh0_mesh_30: {} as THREE.Mesh,
        mesh0_mesh_31: {} as THREE.Mesh,
        mesh0_mesh_32: {} as THREE.Mesh,
        mesh0_mesh_33: {} as THREE.Mesh,
        mesh0_mesh_34: {} as THREE.Mesh,
        mesh0_mesh_35: {} as THREE.Mesh,
        mesh0_mesh_36: {} as THREE.Mesh,
        mesh0_mesh_37: {} as THREE.Mesh,
        mesh0_mesh_38: {} as THREE.Mesh,
        mesh0_mesh_39: {} as THREE.Mesh,
        mesh134_mesh: {} as THREE.Mesh,
        mesh134_mesh_1: {} as THREE.Mesh,
        mesh134_mesh_2: {} as THREE.Mesh,
        mesh134_mesh_3: {} as THREE.Mesh,
        mesh134_mesh_4: {} as THREE.Mesh,
        mesh134_mesh_5: {} as THREE.Mesh,
        mesh134_mesh_6: {} as THREE.Mesh,
        mesh134_mesh_7: {} as THREE.Mesh,
        mesh134_mesh_8: {} as THREE.Mesh,
        mesh134_mesh_9: {} as THREE.Mesh,
        mesh134_mesh_10: {} as THREE.Mesh,
        mesh134_mesh_11: {} as THREE.Mesh,
        mesh134_mesh_12: {} as THREE.Mesh,
        mesh134_mesh_13: {} as THREE.Mesh,
        mesh134_mesh_14: {} as THREE.Mesh,
        mesh134_mesh_15: {} as THREE.Mesh,
        mesh134_mesh_16: {} as THREE.Mesh,
        mesh134_mesh_17: {} as THREE.Mesh,
        mesh152_mesh: {} as THREE.Mesh,
        mesh152_mesh_1: {} as THREE.Mesh,
        mesh152_mesh_2: {} as THREE.Mesh,
        mesh152_mesh_3: {} as THREE.Mesh,
        mesh152_mesh_4: {} as THREE.Mesh,
        mesh152_mesh_5: {} as THREE.Mesh,
        mesh152_mesh_6: {} as THREE.Mesh,
        mesh152_mesh_7: {} as THREE.Mesh,
        mesh152_mesh_8: {} as THREE.Mesh,
        mesh152_mesh_9: {} as THREE.Mesh,
        mesh152_mesh_10: {} as THREE.Mesh,
        mesh152_mesh_11: {} as THREE.Mesh,
        mesh152_mesh_12: {} as THREE.Mesh,
        mesh152_mesh_13: {} as THREE.Mesh,
        mesh152_mesh_14: {} as THREE.Mesh,
        mesh152_mesh_15: {} as THREE.Mesh,
        mesh152_mesh_16: {} as THREE.Mesh,
        mesh169_mesh: {} as THREE.Mesh,
        mesh169_mesh_1: {} as THREE.Mesh,
        mesh169_mesh_2: {} as THREE.Mesh,
        mesh169_mesh_3: {} as THREE.Mesh,
        mesh169_mesh_4: {} as THREE.Mesh,
        mesh169_mesh_5: {} as THREE.Mesh,
        mesh169_mesh_6: {} as THREE.Mesh,
        mesh169_mesh_7: {} as THREE.Mesh,
        mesh169_mesh_8: {} as THREE.Mesh,
        mesh169_mesh_9: {} as THREE.Mesh,
        mesh169_mesh_10: {} as THREE.Mesh,
        mesh169_mesh_11: {} as THREE.Mesh,
        mesh169_mesh_12: {} as THREE.Mesh,
        mesh169_mesh_13: {} as THREE.Mesh,
        mesh169_mesh_14: {} as THREE.Mesh,
        mesh169_mesh_15: {} as THREE.Mesh,
        mesh169_mesh_16: {} as THREE.Mesh,
        mesh169_mesh_17: {} as THREE.Mesh,
        mesh187_mesh: {} as THREE.Mesh,
        mesh187_mesh_1: {} as THREE.Mesh,
        mesh187_mesh_2: {} as THREE.Mesh,
        mesh187_mesh_3: {} as THREE.Mesh,
        mesh187_mesh_4: {} as THREE.Mesh,
        mesh187_mesh_5: {} as THREE.Mesh,
        mesh187_mesh_6: {} as THREE.Mesh,
        mesh187_mesh_7: {} as THREE.Mesh,
        mesh187_mesh_8: {} as THREE.Mesh,
        mesh187_mesh_9: {} as THREE.Mesh,
        mesh187_mesh_10: {} as THREE.Mesh,
        mesh187_mesh_11: {} as THREE.Mesh,
        mesh187_mesh_12: {} as THREE.Mesh,
        mesh187_mesh_13: {} as THREE.Mesh,
        mesh187_mesh_14: {} as THREE.Mesh,
        mesh187_mesh_15: {} as THREE.Mesh,
        mesh203_mesh: {} as THREE.Mesh,
        mesh203_mesh_1: {} as THREE.Mesh,
        mesh203_mesh_2: {} as THREE.Mesh,
        mesh203_mesh_3: {} as THREE.Mesh,
        mesh203_mesh_4: {} as THREE.Mesh,
        mesh203_mesh_5: {} as THREE.Mesh,
        mesh203_mesh_6: {} as THREE.Mesh,
        mesh203_mesh_7: {} as THREE.Mesh,
        mesh203_mesh_8: {} as THREE.Mesh,
        mesh203_mesh_9: {} as THREE.Mesh,
        mesh203_mesh_10: {} as THREE.Mesh,
        mesh203_mesh_11: {} as THREE.Mesh,
        mesh203_mesh_12: {} as THREE.Mesh,
        mesh203_mesh_13: {} as THREE.Mesh,
        mesh217_mesh: {} as THREE.Mesh,
        mesh217_mesh_1: {} as THREE.Mesh,
        mesh217_mesh_2: {} as THREE.Mesh,
        mesh217_mesh_3: {} as THREE.Mesh,
        mesh217_mesh_4: {} as THREE.Mesh,
        mesh217_mesh_5: {} as THREE.Mesh,
      },
      materials: {
        PaletteMaterial001: {} as THREE.MeshStandardMaterial,
      },
    },
    [ASSETS.models.gantryWheelPlate]: {
      nodes: {
        Gantry_Wheel_Plate: {} as THREE.Mesh,
        mesh141_mesh: {} as THREE.Mesh,
        mesh141_mesh_1: {} as THREE.Mesh,
        mesh141_mesh_2: {} as THREE.Mesh,
        mesh141_mesh_3: {} as THREE.Mesh,
        mesh141_mesh_4: {} as THREE.Mesh,
        mesh141_mesh_5: {} as THREE.Mesh,
        mesh141_mesh_6: {} as THREE.Mesh,
        mesh141_mesh_7: {} as THREE.Mesh,
        mesh141_mesh_8: {} as THREE.Mesh,
        mesh141_mesh_9: {} as THREE.Mesh,
        mesh141_mesh_10: {} as THREE.Mesh,
        mesh141_mesh_11: {} as THREE.Mesh,
        mesh141_mesh_12: {} as THREE.Mesh,
        mesh141_mesh_13: {} as THREE.Mesh,
        mesh141_mesh_14: {} as THREE.Mesh,
        mesh141_mesh_15: {} as THREE.Mesh,
        mesh141_mesh_16: {} as THREE.Mesh,
        mesh141_mesh_17: {} as THREE.Mesh,
        mesh159_mesh: {} as THREE.Mesh,
        mesh159_mesh_1: {} as THREE.Mesh,
        mesh159_mesh_2: {} as THREE.Mesh,
        mesh159_mesh_3: {} as THREE.Mesh,
        mesh159_mesh_4: {} as THREE.Mesh,
        mesh159_mesh_5: {} as THREE.Mesh,
        mesh159_mesh_6: {} as THREE.Mesh,
        mesh159_mesh_7: {} as THREE.Mesh,
        mesh159_mesh_8: {} as THREE.Mesh,
        mesh159_mesh_9: {} as THREE.Mesh,
        mesh159_mesh_10: {} as THREE.Mesh,
        mesh159_mesh_11: {} as THREE.Mesh,
        mesh159_mesh_12: {} as THREE.Mesh,
        mesh159_mesh_13: {} as THREE.Mesh,
        mesh159_mesh_14: {} as THREE.Mesh,
        mesh159_mesh_15: {} as THREE.Mesh,
        mesh159_mesh_16: {} as THREE.Mesh,
        mesh176_mesh: {} as THREE.Mesh,
        mesh176_mesh_1: {} as THREE.Mesh,
        mesh176_mesh_2: {} as THREE.Mesh,
        mesh176_mesh_3: {} as THREE.Mesh,
        mesh176_mesh_4: {} as THREE.Mesh,
        mesh176_mesh_5: {} as THREE.Mesh,
        mesh176_mesh_6: {} as THREE.Mesh,
        mesh176_mesh_7: {} as THREE.Mesh,
        mesh176_mesh_8: {} as THREE.Mesh,
        mesh176_mesh_9: {} as THREE.Mesh,
        mesh176_mesh_10: {} as THREE.Mesh,
        mesh176_mesh_11: {} as THREE.Mesh,
        mesh176_mesh_12: {} as THREE.Mesh,
        mesh176_mesh_13: {} as THREE.Mesh,
        mesh176_mesh_14: {} as THREE.Mesh,
        mesh176_mesh_15: {} as THREE.Mesh,
        mesh192_mesh: {} as THREE.Mesh,
        mesh192_mesh_1: {} as THREE.Mesh,
        mesh192_mesh_2: {} as THREE.Mesh,
        mesh192_mesh_3: {} as THREE.Mesh,
        mesh192_mesh_4: {} as THREE.Mesh,
        mesh192_mesh_5: {} as THREE.Mesh,
        mesh192_mesh_6: {} as THREE.Mesh,
        mesh192_mesh_7: {} as THREE.Mesh,
        mesh192_mesh_8: {} as THREE.Mesh,
        mesh192_mesh_9: {} as THREE.Mesh,
        mesh192_mesh_10: {} as THREE.Mesh,
        mesh192_mesh_11: {} as THREE.Mesh,
        mesh192_mesh_12: {} as THREE.Mesh,
        mesh192_mesh_13: {} as THREE.Mesh,
        mesh206_mesh: {} as THREE.Mesh,
        mesh206_mesh_1: {} as THREE.Mesh,
        mesh206_mesh_2: {} as THREE.Mesh,
        mesh206_mesh_3: {} as THREE.Mesh,
        mesh206_mesh_4: {} as THREE.Mesh,
        mesh206_mesh_5: {} as THREE.Mesh,
        mesh206_mesh_6: {} as THREE.Mesh,
        mesh206_mesh_7: {} as THREE.Mesh,
        mesh206_mesh_8: {} as THREE.Mesh,
        mesh206_mesh_9: {} as THREE.Mesh,
        mesh206_mesh_10: {} as THREE.Mesh,
        mesh206_mesh_11: {} as THREE.Mesh,
        mesh206_mesh_12: {} as THREE.Mesh,
        mesh206_mesh_13: {} as THREE.Mesh,
        mesh206_mesh_14: {} as THREE.Mesh,
        mesh206_mesh_15: {} as THREE.Mesh,
        mesh206_mesh_16: {} as THREE.Mesh,
        mesh206_mesh_17: {} as THREE.Mesh,
      },
      materials: {
        PaletteMaterial001: {} as THREE.MeshStandardMaterial,
      },
    },
    [ASSETS.models.rotaryToolBase]: {
      nodes: { mesh: {} as THREE.Mesh },
      materials: { material: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.rotaryToolImplement]: {
      nodes: { mesh: {} as THREE.Mesh },
      materials: { material: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.soilSensor]: {
      nodes: {
        Soil_Sensor: {} as THREE.Mesh,
        mesh0_mesh: {} as THREE.Mesh,
        mesh0_mesh_1: {} as THREE.Mesh,
        mesh0_mesh_2: {} as THREE.Mesh,
        mesh0_mesh_3: {} as THREE.Mesh,
        mesh0_mesh_4: {} as THREE.Mesh,
        mesh0_mesh_5: {} as THREE.Mesh,
        mesh0_mesh_6: {} as THREE.Mesh,
        mesh0_mesh_7: {} as THREE.Mesh,
        mesh0_mesh_8: {} as THREE.Mesh,
        mesh0_mesh_9: {} as THREE.Mesh,
        mesh0_mesh_10: {} as THREE.Mesh,
        mesh0_mesh_11: {} as THREE.Mesh,
        mesh0_mesh_12: {} as THREE.Mesh,
        mesh0_mesh_13: {} as THREE.Mesh,
        mesh0_mesh_14: {} as THREE.Mesh,
        mesh0_mesh_15: {} as THREE.Mesh,
        mesh0_mesh_16: {} as THREE.Mesh,
        mesh0_mesh_17: {} as THREE.Mesh,
        mesh0_mesh_18: {} as THREE.Mesh,
        mesh0_mesh_19: {} as THREE.Mesh,
        mesh0_mesh_20: {} as THREE.Mesh,
        mesh0_mesh_21: {} as THREE.Mesh,
        mesh0_mesh_22: {} as THREE.Mesh,
        mesh0_mesh_23: {} as THREE.Mesh,
        mesh0_mesh_24: {} as THREE.Mesh,
        mesh0_mesh_25: {} as THREE.Mesh,
        mesh584_mesh: {} as THREE.Mesh,
        mesh584_mesh_1: {} as THREE.Mesh,
        mesh584_mesh_2: {} as THREE.Mesh,
        mesh584_mesh_3: {} as THREE.Mesh,
        mesh584_mesh_4: {} as THREE.Mesh,
        mesh584_mesh_5: {} as THREE.Mesh,
        mesh584_mesh_6: {} as THREE.Mesh,
        mesh584_mesh_7: {} as THREE.Mesh,
        mesh584_mesh_8: {} as THREE.Mesh,
        mesh584_mesh_9: {} as THREE.Mesh,
        mesh584_mesh_10: {} as THREE.Mesh,
        mesh584_mesh_11: {} as THREE.Mesh,
        mesh584_mesh_12: {} as THREE.Mesh,
        mesh584_mesh_13: {} as THREE.Mesh,
        mesh584_mesh_14: {} as THREE.Mesh,
        mesh584_mesh_15: {} as THREE.Mesh,
        mesh584_mesh_16: {} as THREE.Mesh,
        mesh584_mesh_17: {} as THREE.Mesh,
      },
      materials: {
        PaletteMaterial001: {} as THREE.MeshStandardMaterial,
      },
    },
    [ASSETS.models.seedTrough]: {
      nodes: { Seed_Trough: {} as THREE.Mesh },
      materials: {
        [SeedTroughAssemblyMaterial.two]: {} as THREE.MeshStandardMaterial,
      },
    },
    [ASSETS.models.seedTroughAssembly]: {
      nodes: {
        mesh0_mesh: {} as THREE.Mesh,
        mesh0_mesh_1: {} as THREE.Mesh,
        Seed_Trough: {} as THREE.Mesh,
      },
      materials: {
        [SeedTroughAssemblyMaterial.zero]: {} as THREE.MeshStandardMaterial,
        [SeedTroughAssemblyMaterial.one]: {} as THREE.MeshStandardMaterial,
        [SeedTroughAssemblyMaterial.two]: {} as THREE.MeshStandardMaterial,
      },
    },
    [ASSETS.models.seedTroughHolder]: {
      nodes: {
        Seed_Trough_Holder_Mount_Plate: {} as THREE.Mesh,
        M5_x_10mm_Screw: {} as THREE.Mesh,
      },
      materials: {
        [SeedTroughHolderMaterial.zero]: {} as THREE.MeshStandardMaterial,
        [SeedTroughHolderMaterial.one]: {} as THREE.MeshStandardMaterial,
      },
    },
    [ASSETS.models.vacuumPumpCover]: {
      nodes: {
        M5_x_10mm_Screw: {} as THREE.Mesh,
        Vacuum_Pump_Cover: {} as THREE.Mesh,
      },
      materials: {
        [VacuumPumpCoverMaterial.zero]: {} as THREE.MeshStandardMaterial,
        [VacuumPumpCoverMaterial.one]: {} as THREE.MeshStandardMaterial,
      },
    },
    [ASSETS.models.leftBracket]: {
      nodes: { [PartName.leftBracket]: {} as THREE.Mesh },
    },
    [ASSETS.models.rightBracket]: {
      nodes: { [PartName.rightBracket]: {} as THREE.Mesh },
    },
    [ASSETS.models.beltClip]: {
      nodes: { [PartName.beltClip]: {} as THREE.Mesh },
    },
    [ASSETS.models.zStop]: {
      nodes: { [PartName.zStop]: {} as THREE.Mesh },
    },
    [ASSETS.models.utm]: {
      nodes: { [PartName.utm]: {} as THREE.Mesh },
      materials: { PaletteMaterial001: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.ccSupportHorizontal]: {
      nodes: { [PartName.ccSupportHorizontal]: {} as THREE.Mesh },
    },
    [ASSETS.models.ccSupportVertical]: {
      nodes: { [PartName.ccSupportVertical]: {} as THREE.Mesh },
    },
    [ASSETS.models.housingVertical]: {
      nodes: { [PartName.housingVertical]: {} as THREE.Mesh },
    },
    [ASSETS.models.horizontalMotorHousing]: {
      nodes: { [PartName.horizontalMotorHousing]: {} as THREE.Mesh },
      materials: { PaletteMaterial001: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.zAxisMotorMount]: {
      nodes: { [PartName.zAxisMotorMount]: {} as THREE.Mesh },
      materials: { PaletteMaterial001: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.toolbay3]: {
      nodes: {
        [PartName.toolbay3]: {} as THREE.Mesh,
        [PartName.toolbay3Logo]: {} as THREE.Mesh,
      },
    },
    [ASSETS.models.toolbay1]: {
      nodes: {
        [PartName.toolbay1]: {} as THREE.Mesh,
        [PartName.toolbay1Logo]: {} as THREE.Mesh,
      },
    },
    [ASSETS.models.seeder]: {
      nodes: { [PartName.seeder]: {} as THREE.Mesh },
      materials: { PaletteMaterial001: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.weeder]: {
      nodes: { [PartName.weeder]: {} as THREE.Mesh },
      materials: { PaletteMaterial001: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.seedTray]: {
      nodes: { [PartName.seedTray]: {} as THREE.Mesh },
    },
    [ASSETS.models.seedBin]: {
      nodes: { [PartName.seedBin]: {} as THREE.Mesh },
    },
    [ASSETS.models.wateringNozzle]: {
      nodes: { [PartName.wateringNozzle]: {} as THREE.Mesh },
      materials: { PaletteMaterial001: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.pi]: {
      nodes: { [PartName.pi]: {} as THREE.Mesh },
      materials: { PaletteMaterial001: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.farmduino]: {
      nodes: { [PartName.farmduino]: {} as THREE.Mesh },
      materials: { PaletteMaterial001: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.cameraMountHalf]: {
      nodes: { [PartName.cameraMountHalf]: {} as THREE.Mesh },
    },
    [ASSETS.models.solenoid]: {
      nodes: { [PartName.solenoid]: {} as THREE.Mesh },
      materials: { PaletteMaterial001: {} as THREE.MeshStandardMaterial },
    },
    [ASSETS.models.xAxisCCMount]: {
      nodes: { [PartName.xAxisCCMount]: {} as THREE.Mesh },
    },
    [ASSETS.models.box]: {
      nodes: {
        Electronics_Box: {
          geometry: jest.fn(),
          material: { color: { set: jest.fn() } },
        },
        Electronics_Box_Gasket: {
          geometry: jest.fn(),
          material: { color: { set: jest.fn() } },
        },
        Electronics_Box_Lid: {
          geometry: jest.fn(),
          material: { color: { set: jest.fn() } },
        },
      },
      materials: {
        [ElectronicsBoxMaterial.box]: {
          color: { set: jest.fn() },
          transparent: false,
        },
        [ElectronicsBoxMaterial.gasket]: {
          color: { set: jest.fn() },
          transparent: false,
        },
        [ElectronicsBoxMaterial.lid]: {
          color: { set: jest.fn() },
          transparent: false,
        },
      },
    },
    [ASSETS.models.btn]: {
      nodes: {
        ["Push_Button_-_Red"]: {
          geometry: jest.fn(),
          material: { color: { set: jest.fn() } },
        },
      },
      materials: {
        [ElectronicsBoxMaterial.button]: {
          color: { set: jest.fn() },
          transparent: false,
        },
      },
    },
    [ASSETS.models.led]: {
      nodes: {
        LED: {
          geometry: jest.fn(),
          material: { color: { set: jest.fn() } },
        },
      },
      materials: {
        [ElectronicsBoxMaterial.led]: {
          color: { set: jest.fn() },
          transparent: false,
        },
      },
    },
  }[key]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (useGLTF as any).preload = jest.fn();
  return {
    ...jest.requireActual("@react-three/drei"),
    useGLTF,
    RoundedBox: ({ name }: { name: string }) =>
      <div className={"cylinder"}>{name}</div>,
    Plane: (props: React.ComponentProps<typeof Plane>) =>
      // @ts-expect-error geometry props not assignable to div
      <div className={"plane"} {...props}>{props.name} {props.url}</div>,
    Cylinder: ({ name }: { name: string }) =>
      <div className={"cylinder"}>{name}</div>,
    Torus: ({ name }: { name: string }) =>
      <div className={"torus"}>{name}</div>,
    // Sphere not mocked
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Box: (props: any) =>
      <div className={"box" + props.name} {...props}>{props.children}</div>,
    Extrude: ({ name }: { name: string }) =>
      <div className={"extrude"}>{name}</div>,
    Line: ({ name }: { name: string }) =>
      <div className={"line"}>{name}</div>,
    Trail: (props: React.ComponentProps<typeof Trail>) =>
      <div className={"trail"}>{props.children} {props.attenuation?.(2)}</div>,
    Tube: (props: React.ComponentProps<typeof Tube>) =>
      // @ts-expect-error geometry props not assignable to div
      <div className={"tube"} {...props}>{props.children}</div>,
    Center: ({ children }: { children: ReactNode }) =>
      <div className={"center"}>{children}</div>,
    Text3D: ({ children }: { children: ReactNode }) =>
      <div className={"text"}>{children}</div>,
    Detailed: ({ children }: { children: ReactNode }) =>
      <div className={"detailed"}>{children}</div>,
    Html: ({ children }: { children: ReactNode }) =>
      <div className={"html"}>{children}</div>,
    PerspectiveCamera: ({ name }: { name: string }) =>
      <div className={"perspective-camera"}>{name}</div>,
    useCursor: jest.fn(),
    useTexture: jest.fn(() => ({
      wrapS: "",
      wrapT: "",
      repeat: { set: jest.fn() },
    })),
    GizmoHelper: ({ name }: { name: string }) =>
      <div className={"gizmo-helper"}>{name}</div>,
    GizmoViewcube: ({ name }: { name: string }) =>
      <div className={"gizmo-view-cube"}>{name}</div>,
    OrbitControls: ({ name }: { name: string }) =>
      <div className={"orbit-controls"}>{name}</div>,
    Circle: ({ name, children }: { name: string, children: ReactNode }) =>
      <div className={"circle" + name}>{children}</div>,
    Stats: ({ name }: { name: string }) =>
      <div className={"stats"}>{name}</div>,
    Billboard: ({ name, children }: { name: string, children: ReactNode }) =>
      <div className={"billboard" + name}>{children}</div>,
    Image: (props: React.ComponentProps<typeof Image>) =>
      // @ts-expect-error geometry props not assignable to div
      <div className={"image"} {...props}>{props.name} {props.url}</div>,
    Clouds: (props: React.ComponentProps<typeof Clouds>) =>
      // @ts-expect-error geometry props not assignable to div
      <div className={"clouds"} {...props}>{props.children}</div>,
    Cloud: (props: React.ComponentProps<typeof Cloud>) =>
      // @ts-expect-error geometry props not assignable to div
      <div className={"cloud"} {...props} />,
    OrthographicCamera: ({ name }: { name: string }) =>
      <div className={"orthographic-camera"}>{name}</div>,
    useHelper: jest.fn(),
  };
});
