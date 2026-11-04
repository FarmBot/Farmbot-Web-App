import React from "react";
import { useThree } from "@react-three/fiber";
import { Center, type OnCenterCallbackProps } from "@react-three/drei";
import { Box3, OrthographicCamera, Vector3 } from "three";

export interface ToolPreviewCameraProps {
  margin: number;
  onCentered(props: OnCenterCallbackProps): void;
  children: React.ReactNode;
}

const fitCamera = (camera: OrthographicCamera, box: Box3, margin: number) => {
  const center = box.getCenter(new Vector3());
  const radius = box.getSize(new Vector3()).length() / 2;
  const distance = Math.max(1, radius * 4 * margin);
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
  // The bounding sphere covers the model at every orbit angle.
  const extent = Math.max(1, radius * 1.1);
  camera.near = Math.max(0.1, distance - extent);
  camera.far = Math.max(camera.near + 1, distance + extent);
  camera.updateProjectionMatrix();
};

export const ToolPreviewCamera = (props: ToolPreviewCameraProps) => {
  const { camera, invalidate } = useThree();
  const lastFit = React.useRef<string | undefined>(undefined);
  return <Center visible={false} onCentered={centered => {
    const { container } = centered;
    container.visible = false;
    container.updateWorldMatrix(true, true);
    const box = new Box3().setFromObject(container);
    if (camera instanceof OrthographicCamera && !box.isEmpty()) {
      const fitKey = JSON.stringify([
        camera.uuid, camera.left, camera.right, camera.top, camera.bottom,
        props.margin, box.min.toArray(), box.max.toArray(),
      ]);
      // Center can run again after orbiting without a model or viewport change.
      if (fitKey !== lastFit.current) {
        fitCamera(camera, box, props.margin);
        lastFit.current = fitKey;
      }
    }
    props.onCentered(centered);
    container.visible = true;
    invalidate();
  }}>
    {props.children}
  </Center>;
};
