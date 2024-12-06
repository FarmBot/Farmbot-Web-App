/* eslint-disable no-null/no-null */
import React, { useRef } from "react";
import * as THREE from "three";
import {
  Cylinder, Html, PerspectiveCamera, useGLTF,
} from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { GLTF } from "three-stdlib";
import { BindingTargetDropdown, pinBindingLabel } from "./pin_binding_input_group";
import { BoxTopBaseProps, PinBindingListItems } from "./interfaces";
import { setPinBinding, findBinding, triggerBinding } from "./actions";
import { BufferGeometry } from "three";
import { debounce, some } from "lodash";
import { t } from "../../i18next_wrapper";
import { isExpress } from "../../settings/firmware/firmware_hardware_support";
import { ButtonPin } from "./list_and_label_support";
import {
  AmbientLight, DirectionalLight, Group, Mesh, PointLight,
} from "../../three_d_garden/components";
import {
  ASSETS, ElectronicsBoxMaterial, LIB_DIR,
} from "../../three_d_garden/constants";

type Box = GLTF & {
  nodes: {
    Electronics_Box: THREE.Mesh;
    Electronics_Box_Gasket: THREE.Mesh;
    Electronics_Box_Lid: THREE.Mesh;
  };
  materials: {
    [ElectronicsBoxMaterial.box]: THREE.MeshStandardMaterial;
    [ElectronicsBoxMaterial.gasket]: THREE.MeshStandardMaterial;
    [ElectronicsBoxMaterial.lid]: THREE.MeshStandardMaterial;
  };
}

type Btn = GLTF & {
  nodes: {
    ["Push_Button_-_Red"]: THREE.Mesh;
  };
  materials: {
    [ElectronicsBoxMaterial.button]: THREE.MeshStandardMaterial;
  };
}

type Led = GLTF & {
  nodes: {
    LED: THREE.Mesh;
  };
  materials: {
    [ElectronicsBoxMaterial.led]: THREE.MeshStandardMaterial;
  };
}

const MODELS = {
  box: ASSETS.models.box,
  btn: ASSETS.models.btn,
  led: ASSETS.models.led,
};

Object.values(MODELS).map(model => useGLTF.preload(model, LIB_DIR));

type MeshObject = THREE.Mesh<BufferGeometry, THREE.MeshStandardMaterial>;

const Z = 131;
export namespace IColor {
  export enum estop {
    on = 0xef4037,
    off = 0xd89a97,
  }
  export enum unlock {
    on = 0xf5e909,
    off = 0xe1de94,
  }
  export enum connect {
    on = 0x1073e0,
    off = 0x88a4c3,
  }
  export enum sync {
    on = 0x62c020,
    off = 0x94b87b,
  }
  export enum blank {
    on = 0xffffff,
    off = 0xf4f4f4,
  }
}

const changeItemsInGroup = (
  meshObject: MeshObject,
  cb: (x: MeshObject) => void,
  items = ["button-center", "button-color"],
) => {
  meshObject.children.map(child => {
    const object = child as MeshObject;
    if (some(items.map(item => child.name.includes(item)))) {
      cb(object);
    }
    changeItemsInGroup(object, cb, items);
  });
};

export const setZForAllInGroup = (e: ThreeEvent<PointerEvent>, z: number) => {
  changeItemsInGroup(
    e.object.parent as MeshObject,
    x => x.position.z = z);
};

interface ButtonOrLedItem {
  label: string;
  pinNumber: number;
  blink?: boolean;
  on?: boolean;
  position: number;
  color: { on: number, off: number };
  ref?: React.MutableRefObject<MeshObject | null>;
}

export const Model = (props: BoxTopBaseProps) => {
  const box = useGLTF(ASSETS.models.box, LIB_DIR) as Box;
  const btn = useGLTF(ASSETS.models.btn, LIB_DIR) as Btn;
  const led = useGLTF(ASSETS.models.led, LIB_DIR) as Led;
  const SCALE = 1000;

  const syncLed = useRef<MeshObject>(null);
  const connLed = useRef<MeshObject>(null);
  const unlock = useRef<MeshObject>(null);
  const estop = useRef<MeshObject>(null);

  const {
    locked, sync_status,
  } = props.bot.hardware.informational_settings;
  const findPinBinding = findBinding(props.resources);
  const clickBinding = triggerBinding(props.resources, props.botOnline);
  const express = isExpress(props.firmwareHardware);

  const BUTTONS: ButtonOrLedItem[] = [
    {
      label: t("Button 1"),
      pinNumber: ButtonPin.estop,
      on: props.botOnline && !locked,
      position: -60,
      color: {
        on: IColor.estop.on,
        off: IColor.estop.off,
      },
      ref: estop,
    },
    {
      label: t("Button 2"),
      pinNumber: ButtonPin.unlock,
      blink: props.botOnline && locked,
      position: -30,
      color: {
        on: IColor.unlock.on,
        off: IColor.unlock.off,
      },
      ref: unlock,
    },
    {
      label: t("Button 3"),
      pinNumber: ButtonPin.btn3,
      position: 0,
      color: {
        on: IColor.blank.on,
        off: IColor.blank.off,
      },
    },
    {
      label: t("Button 4"),
      pinNumber: ButtonPin.btn4,
      position: 30,
      color: {
        on: IColor.blank.on,
        off: IColor.blank.off,
      },
    },
    {
      label: t("Button 5"),
      pinNumber: ButtonPin.btn5,
      position: 60,
      color: {
        on: IColor.blank.on,
        off: IColor.blank.off,
      },
    },
  ];

  const LEDS: ButtonOrLedItem[] = [
    {
      label: t("Sync"),
      pinNumber: -1,
      on: sync_status == "synced",
      blink: sync_status == "syncing",
      position: -45,
      color: {
        on: IColor.sync.on,
        off: IColor.sync.off,
      },
      ref: syncLed,
    },
    {
      label: t("Connectivity"),
      pinNumber: -1,
      on: props.botOnline,
      position: -15,
      color: {
        on: IColor.connect.on,
        off: IColor.connect.off,
      },
      ref: connLed,
    },
    {
      label: t("LED 3"),
      pinNumber: -1,
      position: 15,
      color: {
        on: IColor.blank.on,
        off: IColor.blank.off,
      },
    },
    {
      label: t("LED 4"),
      pinNumber: -1,
      position: 45,
      color: {
        on: IColor.blank.on,
        off: IColor.blank.off,
      },
    },
  ];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    BUTTONS.concat(LEDS).map(item => {
      const current = item.ref?.current;
      const { on, off } = item.color;
      if (current) {
        if (item.blink) {
          current.material.color.set(t % 2 < 1 ? on : off);
        } else {
          current.material.color.set(item.on ? on : off);
        }
      }
    });
  });

  const getLabel = (binding: PinBindingListItems | undefined) => {
    return pinBindingLabel({
      resources: props.resources,
      sequenceIdInput: binding?.sequence_id,
      specialActionInput: binding?.special_action,
    })?.label;
  };

  const [hovered, setHovered] = React.useState<number | undefined>();
  const leave = (e: ThreeEvent<PointerEvent>) => {
    setHovered(undefined);
    setZForAllInGroup(e, Z);
    document.body.style.cursor = "default";
  };
  return <Group dispose={null}
    rotation={[0, 0, Math.PI / 2]}>
    <PerspectiveCamera makeDefault name="camera" fov={30} near={0.1} far={1000}
      position={[-150, 0, 300]}
      rotation={[0, -Math.PI / 6, -Math.PI / 2]} />
    <PointLight intensity={2} position={[0, 0, 200]} rotation={[0, 0, 0]}
      distance={0} decay={0} />
    <DirectionalLight intensity={0.1}
      position={[-100, 0, 100]} rotation={[0, 0, 0]} />
    <AmbientLight intensity={0.5} />
    <Mesh name={"electronicsBox"}
      geometry={box.nodes.Electronics_Box.geometry}
      material={box.materials[ElectronicsBoxMaterial.box]}
      scale={SCALE}
      material-color={0xffffff}
      material-emissive={0x999999} />
    <Mesh name={"electronicsBoxGasket"}
      geometry={box.nodes.Electronics_Box_Gasket.geometry}
      material={box.materials[ElectronicsBoxMaterial.gasket]}
      scale={SCALE} />
    <Mesh name={"electronicsBoxLid"}
      geometry={box.nodes.Electronics_Box_Lid.geometry}
      material={box.materials[ElectronicsBoxMaterial.lid]}
      scale={SCALE} />
    {BUTTONS
      .filter((_, index) => express ? index == 0 : true)
      .map(button => {
        const { position, color, ref, label, pinNumber } = button;
        const btnPosition = express ? 0 : position;
        const binding = findPinBinding(pinNumber);
        const isHovered = hovered == pinNumber;
        const click = debounce(clickBinding(pinNumber));
        const setCursor = () =>
          document.body.style.cursor = binding ? "pointer" : "not-allowed";
        const enter = () => {
          !props.isEditing && setHovered(pinNumber);
          setCursor();
        };
        return <Group key={btnPosition} name={"button-group"}
          onPointerUp={leave}>
          <Mesh name={"button-housing"}
            geometry={btn.nodes["Push_Button_-_Red"].geometry}
            material={btn.materials[ElectronicsBoxMaterial.button]}
            position={[-30, btnPosition, Z]}
            scale={SCALE}
            material-color={0xcccccc} />
          <Group name={"action-group"}
            onPointerOver={enter}
            onPointerMove={setCursor}
            onClick={setCursor}
            onPointerOut={leave}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              if (!props.isEditing) {
                setZForAllInGroup(e, Z - 3);
                click();
              }
            }}>
            <Cylinder ref={ref}
              name={"button-color"}
              material-color={color}
              args={[9, 0, 3.5]}
              position={[-30, btnPosition, Z]}
              rotation={[Math.PI / 2, 0, 0]} />
            <Cylinder name={"button-center"}
              material-color={(binding && isHovered) ? 0xdddddd : 0xcccccc}
              args={[6.75, 0, 4]}
              position={[-30, btnPosition, Z]}
              rotation={[Math.PI / 2, 0, 0]} />
            <Html name={"label"}
              center={true}
              position={[-7, btnPosition, Z]}>
              {props.isEditing
                ? <BindingTargetDropdown key={btnPosition}
                  change={setPinBinding({
                    binding,
                    dispatch: props.dispatch,
                    resources: props.resources,
                    pinNumber: pinNumber,
                  })}
                  resources={props.resources}
                  sequenceIdInput={binding?.sequence_id}
                  specialActionInput={binding?.special_action} />
                : <p className={[
                  "btn-label",
                  isHovered ? "hovered" : "",
                  binding ? "" : "unbound",
                ].join(" ")}>
                  {getLabel(binding) || label}
                </p>}
            </Html>
          </Group>
        </Group>;
      })}
    {LEDS
      .filter(() => !express)
      .map(ledIndicator => {
        const { position, color, ref } = ledIndicator;
        return <Group key={position}>
          <Mesh name={"led-housing"}
            geometry={led.nodes.LED.geometry}
            material={led.materials[ElectronicsBoxMaterial.led]}
            position={[-50, position, Z]}
            material-color={0xcccccc}
            scale={SCALE} />
          <Cylinder ref={ref} name={"led-color"}
            material-color={color}
            args={[6.75, 6.75, 3]}
            position={[-50, position, Z]}
            rotation={[Math.PI / 2, 0, 0]} />
          <Html name={"label"}
            center={true}
            position={[-66, position, Z]}>
            <p className={"led-label"}>{ledIndicator.label}</p>
          </Html>
        </Group>;
      })}
  </Group>;
};

export const ElectronicsBoxModel = (props: BoxTopBaseProps) => {
  return <div className={"electronics-box-3d-model"}>
    <Canvas>
      <Model {...props} />
    </Canvas>
  </div>;
};
