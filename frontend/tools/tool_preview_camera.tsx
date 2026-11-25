import React from "react";
import { useThree } from "@react-three/fiber";
import { Center, type OnCenterCallbackProps } from "@react-three/drei";
import { Box3, OrthographicCamera, Vector3 } from "three";

export interface ToolPreviewCameraProps {
  margin: number;
  fixedBounds?: Box3;
  viewportSize?: { width: number; height: number };
  onCentered(props: OnCenterCallbackProps): void;
  children: React.ReactNode;
}

const fitCamera = (
  camera: OrthographicCamera,
  box: Box3,
  margin: number,
  viewportSize: ToolPreviewCameraProps["viewportSize"],
) => {
  if (viewportSize) {
    const { width, height } = viewportSize;
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
  }
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
  const onCentered = (centered: OnCenterCallbackProps) => {
    const { container } = centered;
    container.visible = false;
    container.updateWorldMatrix(true, true);
    const box = props.fixedBounds || new Box3().setFromObject(container);
    if (camera instanceof OrthographicCamera && !box.isEmpty()) {
      const viewport = props.viewportSize
        ? [props.viewportSize.width, props.viewportSize.height]
        : [camera.left, camera.right, camera.top, camera.bottom];
      const fitKey = JSON.stringify([
        camera.uuid, viewport, props.margin, box.min.toArray(), box.max.toArray(),
      ]);
      // Center can run again after orbiting without a model or viewport change.
      if (fitKey !== lastFit.current) {
        if (props.fixedBounds) { camera.lookAt(box.getCenter(new Vector3())); }
        fitCamera(camera, box, props.margin, props.viewportSize);
        lastFit.current = fitKey;
      }
    }
    props.onCentered(centered);
    container.visible = true;
    invalidate();
  };
  return <Center visible={false} disable={!!props.fixedBounds}
    onCentered={onCentered}>
    {props.children}
  </Center>;
};
