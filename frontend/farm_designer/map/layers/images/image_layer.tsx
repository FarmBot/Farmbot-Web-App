import * as React from "react";
import { MapTransformProps } from "../../interfaces";
import { CameraCalibrationData } from "../../../interfaces";
import { TaggedImage } from "farmbot";
import { MapImage } from "./map_image";
import { reverse, cloneDeep } from "lodash";
import { GetWebAppConfigValue } from "../../../../config_storage/actions";
import moment from "moment";
import { equals } from "../../../../util";

export interface ImageLayerProps {
  visible: boolean;
  images: TaggedImage[];
  mapTransformProps: MapTransformProps;
  cameraCalibrationData: CameraCalibrationData;
  getConfigValue: GetWebAppConfigValue;
}

export class ImageLayer extends React.Component<ImageLayerProps> {

  shouldComponentUpdate(nextProps: ImageLayerProps) {
    return !equals(this.props, nextProps);
  }

  render() {
    const {
      visible, images, mapTransformProps, cameraCalibrationData, getConfigValue
    } = this.props;
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
              mapTransformProps={mapTransformProps} />
          )}
    </g>;
  }
}
