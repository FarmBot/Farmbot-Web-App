import React from "react";
import { useThree } from "@react-three/fiber";
import { Center, type OnCenterCallbackProps } from "@react-three/drei";
import { Box3, Camera, Object3D, OrthographicCamera, Vector3 } from "three";

export interface ToolPreviewCameraProps {
  margin: number;
  onCentered(props: OnCenterCallbackProps): void;
  children: React.ReactNode;
}

const fitCamera = (camera: Camera, container: Object3D, margin: number) => {
  container.updateWorldMatrix(true, true);
  const box = new Box3().setFromObject(container);
  if (!box.isEmpty() && camera instanceof OrthographicCamera) {
    const center = box.getCenter(new Vector3());
    const distance = Math.max(1,
      box.getSize(new Vector3()).length() * 2 * margin);
    const direction = camera.getWorldDirection(new Vector3());
    camera.position.copy(center).addScaledVector(direction, -distance);
    camera.lookAt(center);
    camera.updateMatrixWorld();
    const viewBox = box.clone().applyMatrix4(camera.matrixWorldInverse);
    const size = viewBox.getSize(new Vector3());
    camera.zoom = Math.min(
      (camera.right - camera.left) / Math.max(size.x, 0.001),
      (camera.top - camera.bottom) / Math.max(size.y, 0.001),
    ) / margin;
    const padding = Math.max(1, size.z * 0.1);
    camera.near = Math.max(0.1, -viewBox.max.z - padding);
    camera.far = Math.max(camera.near + 1, -viewBox.min.z + padding);
    camera.updateProjectionMatrix();
  }
};

export const ToolPreviewCamera = (props: ToolPreviewCameraProps) => {
  const { camera, invalidate } = useThree();
  return <Center visible={false} onCentered={centered => {
    const { container } = centered;
    container.visible = false;
    fitCamera(camera, container, props.margin);
    props.onCentered(centered);
    container.visible = true;
    invalidate();
  }}>
    {props.children}
  </Center>;
};
