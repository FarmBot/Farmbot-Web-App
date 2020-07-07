import * as React from "react";
import { MapTransformProps } from "../../interfaces";
import { CameraCalibrationData } from "../../../interfaces";
import { TaggedImage } from "farmbot";
import { MapImage } from "./map_image";
import { reverse, cloneDeep } from "lodash";
import moment from "moment";
import { equals } from "../../../../util";

export interface ImageLayerProps {
  visible: boolean;
  images: TaggedImage[];
  mapTransformProps: MapTransformProps;
  cameraCalibrationData: CameraCalibrationData;
  imageFilterBegin: string;
  imageFilterEnd: string;
  cropImages: boolean;
  hiddenImages: number[];
  hoveredMapImage: number | undefined;
}

export class ImageLayer extends React.Component<ImageLayerProps> {

  shouldComponentUpdate(nextProps: ImageLayerProps) {
    return !equals(this.props, nextProps);
  }

  render() {
    const {
      visible, images, mapTransformProps, cameraCalibrationData,
      imageFilterBegin, imageFilterEnd,
    } = this.props;
    return <g id="image-layer">
      {visible &&
        reverse(cloneDeep(images))
          .filter(imageInRange(imageFilterBegin, imageFilterEnd))
          .filter(img => !isHidden(this.props.hiddenImages, img.body.id))
          .map(img =>
            <MapImage
              image={img}
              key={"image_" + img.body.id}
              hoveredMapImage={this.props.hoveredMapImage}
              cropImage={this.props.cropImages}
              cameraCalibrationData={cameraCalibrationData}
              mapTransformProps={mapTransformProps} />)}
    </g>;
  }
}

export const imageInRange =
  (imageFilterBegin: string | undefined, imageFilterEnd: string | undefined) =>
    (image: TaggedImage | undefined) => {
      if (!image) { return; }
      const createdAt = moment(image.body.created_at);
      const afterBegin = !imageFilterBegin || createdAt.isAfter(imageFilterBegin);
      const beforeEnd = !imageFilterEnd || createdAt.isBefore(imageFilterEnd);
      return afterBegin && beforeEnd;
    };

export const isHidden = (hiddenImages: number[], imageId: number | undefined) =>
  imageId && hiddenImages.includes(imageId);
