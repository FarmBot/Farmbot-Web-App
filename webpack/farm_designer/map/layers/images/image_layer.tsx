import * as React from "react";
import { MapTransformProps } from "../../interfaces";
import { CameraCalibrationData } from "../../../interfaces";
import { TaggedImage } from "farmbot";
import { MapImage } from "./map_image";
import { reverse, cloneDeep } from "lodash";
import { GetWebAppConfigValue } from "../../../../config_storage/actions";
import * as moment from "moment";

export interface ImageLayerProps {
  visible: boolean;
  images: TaggedImage[];
  mapTransformProps: MapTransformProps;
  cameraCalibrationData: CameraCalibrationData;
  sizeOverride?: { width: number, height: number };
  getConfigValue: GetWebAppConfigValue;
}

export function ImageLayer(props: ImageLayerProps) {
  const {
    visible, images, mapTransformProps, cameraCalibrationData, sizeOverride,
    getConfigValue
  } = props;
  const imageFilterBegin = getConfigValue("photo_filter_begin");
  const imageFilterEnd = getConfigValue("photo_filter_end");
  return <g id="image-layer">
    {visible &&
      reverse(cloneDeep(images))
        .filter(x => !imageFilterEnd ||
          moment(x.body.created_at).isBefore(imageFilterEnd.toString()))
        .filter(x => !imageFilterBegin ||
          moment(x.body.created_at).isAfter(imageFilterBegin.toString()))
        .map(img =>
          <MapImage
            image={img}
            key={"image_" + img.body.id}
            cameraCalibrationData={cameraCalibrationData}
            sizeOverride={sizeOverride}
            mapTransformProps={mapTransformProps} />
        )}
  </g>;
}
