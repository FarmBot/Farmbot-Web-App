import * as React from "react";
import { MapTransformProps } from "../interfaces";
import { CameraCalibrationData } from "../../interfaces";
import { TaggedImage } from "../../../resources/tagged_resources";
import { MapImage } from "../map_image";
import { reverse, cloneDeep } from "lodash";

export interface ImageLayerProps {
  visible: boolean;
  images: TaggedImage[];
  mapTransformProps: MapTransformProps;
  cameraCalibrationData: CameraCalibrationData;
  sizeOverride?: { width: number, height: number };
}

export function ImageLayer(props: ImageLayerProps) {
  const {
    visible, images, mapTransformProps, cameraCalibrationData, sizeOverride
   } = props;
  return <g id="image-layer">
    {visible &&
      reverse(cloneDeep(images)).map(img =>
        <MapImage
          image={img}
          key={"image_" + img.body.id}
          cameraCalibrationData={cameraCalibrationData}
          sizeOverride={sizeOverride}
          mapTransformProps={mapTransformProps} />
      )}
  </g>;
}
