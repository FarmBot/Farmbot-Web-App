import React from "react";
import { Cylinder, Tube } from "@react-three/drei";
import { MeshPhongMaterial } from "../../components";
import { easyCubicBezierCurve3 } from "../../helpers";

const distinguishableBlack = "#333";

interface CameraProps {
  kitVersion: string;
}

const cameraCableEnd = (kitVersion: string) => {
  switch (kitVersion) {
    case "v1.9":
      return {
        direction: [-100, 0, 0] as [number, number, number],
        position: [100, 50, -50] as [number, number, number],
      };
    case "v1.7":
    case "v1.8":
    default:
      return {
        direction: [0, 0, 40] as [number, number, number],
        position: [10, 40, -120] as [number, number, number],
      };
  }
};

export const Camera = (props: CameraProps) => {
  const cableEnd = cameraCableEnd(props.kitVersion);
  const cablePath = easyCubicBezierCurve3(
    [0, 0, -40],
    [0, 0, -40],
    cableEnd.direction,
    cableEnd.position,
  );
  return <>
    <Cylinder name={"cameraBody"}
      args={[5, 5, 40]}
      position={[0, 0, -20]}
      rotation={[Math.PI / 2, 0, 0]}>
      <MeshPhongMaterial color={distinguishableBlack} />
    </Cylinder>
    <Tube name={"cameraCable"}
      args={[cablePath, 20, 2.5, 8]}>
      <MeshPhongMaterial color={distinguishableBlack} />
    </Tube>
  </>;
};
