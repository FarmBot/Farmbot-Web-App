import React from "react";
import { MapTransformProps } from "../../interfaces";
import { CameraCalibrationData, DesignerState } from "../../../interfaces";
import { SpecialStatus, TaggedImage } from "farmbot";

import { MapImage } from "./map_image";
import { reverse, cloneDeep, some } from "lodash";
import { equals } from "../../../../util";
import { BooleanSetting, StringSetting } from "../../../../session_keys";
import { GetWebAppConfigValue } from "../../../../config_storage/actions";
import {
  parseFilterSetting, IMAGE_LAYER_CONFIG_KEYS, imageInRange, imageIsHidden,
  filterImagesByType,
} from "../../../../photos/photo_filter_settings/util";

type Image = {
  id?: number | undefined;
  created_at: string;
  updated_at: string;
  device_id: number;
  attachment_processed_at: string | undefined;
  attachment_url: string;
  meta: {
    x: number | undefined;
    y: number | undefined;
    z: number | undefined;
    name?: string;
  };
};


export interface ImageLayerProps {
  visible: boolean;
  images: TaggedImage[];
  mapTransformProps: MapTransformProps;
  cameraCalibrationData: CameraCalibrationData;
  getConfigValue: GetWebAppConfigValue;
  designer: DesignerState;
}

export class ImageLayer extends React.Component<ImageLayerProps> {

  shouldComponentUpdate(nextProps: ImageLayerProps) {
    const configsChanged = some(IMAGE_LAYER_CONFIG_KEYS.map(key =>
      this.props.getConfigValue(key) != nextProps.getConfigValue(key)));
    return !equals(this.props, nextProps) || configsChanged;
  }

  render() {
    const {
      visible, images: originalImages, mapTransformProps, cameraCalibrationData,
      getConfigValue,
    } = this.props;
    const { hiddenImages, shownImages,
      hideUnShownImages, alwaysHighlightImage, hoveredMapImage,
    } = this.props.designer;
    const cropImages = !!getConfigValue(BooleanSetting.crop_images);
    const clipImageLayer = !!getConfigValue(BooleanSetting.clip_image_layer);
    const getFilterValue = parseFilterSetting(getConfigValue);
    const imageFilterBegin = getFilterValue(StringSetting.photo_filter_begin);
    const imageFilterEnd = getFilterValue(StringSetting.photo_filter_end);

    const demoImages: TaggedImage[] = [
      {
        kind: "Image",
        uuid: "someUniqueIdentifier",
        body: {
          id: 1,
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString(),
          device_id: 12345, 
          attachment_processed_at: new Date().toISOString(), 
          attachment_url: "https://hips.hearstapps.com/hmg-prod/images/directly-above-view-of-succulent-plants-at-home-1530023926.jpg",
          meta: {
            x: 300,
            y: 300,
            z: 1, 
            name: "Demo Image",
          },
        } as Image,
        specialStatus: SpecialStatus.SAVED
      },
    ];
    

    const DEMO_MODE = true;

    const images = DEMO_MODE ? demoImages : originalImages;

    console.log(images);

    const hoveredImage: TaggedImage | undefined =
      images.filter(img => img.body.id == hoveredMapImage
        || (alwaysHighlightImage && shownImages.includes(img.body.id || 0)))[0];
    const rangeOverride = alwaysHighlightImage || hideUnShownImages;
    return <g id="image-layer"
      clipPath={clipImageLayer ? "url(#map-grid-clip-path)" : undefined}>
      {visible &&
        reverse(cloneDeep(images))
          .filter(img =>
            (rangeOverride && shownImages.includes(img.body.id || 0))
            || imageInRange(img, imageFilterBegin, imageFilterEnd))
          .filter(img => !imageIsHidden(
            hiddenImages, shownImages, hideUnShownImages, img.body.id))
          .filter(filterImagesByType(this.props.designer))
          .map(img =>
            <MapImage
              image={img}
              key={"image_" + img.body.id}
              hoveredMapImage={hoveredMapImage}
              cropImage={cropImages}
              cameraCalibrationData={cameraCalibrationData}
              mapTransformProps={mapTransformProps} />)}
      {visible && hoveredImage &&
        <MapImage
          image={hoveredImage}
          hoveredMapImage={hoveredMapImage}
          highlighted={true}
          cropImage={cropImages}
          cameraCalibrationData={cameraCalibrationData}
          mapTransformProps={mapTransformProps} />}
    </g>;
  }
}
