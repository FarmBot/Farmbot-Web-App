import React from "react";
import { MapTransformProps } from "../../interfaces";
import {
  CameraCalibrationData, DesignerState, ThreeDDesignerState,
} from "../../../interfaces";
import { TaggedImage } from "farmbot";
import { cameraZCheck, MapImage } from "./map_image";
import { some } from "lodash";
import { equals } from "../../../../util";
import { BooleanSetting, StringSetting } from "../../../../session_keys";
import { GetWebAppConfigValue } from "../../../../config_storage/actions";
import {
  parseFilterSetting, IMAGE_LAYER_CONFIG_KEYS, imageInRange, notHidden,
  filterImagesByType,
} from "../../../../photos/photo_filter_settings/util";

export interface FilterImagesProps {
  visible: boolean;
  images: TaggedImage[] | undefined;
  designer: ThreeDDesignerState | undefined;
  getConfigValue: GetWebAppConfigValue | undefined;
  calibrationZ: string | undefined;
}

export interface TaggedImagePlus extends TaggedImage {
  highlighted: boolean;
}

const hasProcessedAttachment = (image: TaggedImage) =>
  !image.body.attachment_url.includes("placeholder");

export const filterImages = (props: FilterImagesProps): TaggedImagePlus[] => {
  const { visible, images, designer, getConfigValue, calibrationZ } = props;
  if (!images || !visible || !designer || !getConfigValue) { return []; }
  const { hiddenImages, shownImages, hideUnShownImages, alwaysHighlightImage,
    hoveredMapImage,
  } = designer;
  const getFilterValue = parseFilterSetting(getConfigValue);
  const imageFilterBegin = getFilterValue(StringSetting.photo_filter_begin);
  const imageFilterEnd = getFilterValue(StringSetting.photo_filter_end);
  const rangeOverride = alwaysHighlightImage || hideUnShownImages;
  const hoveredImage: TaggedImage | undefined =
    images.filter(img => hasProcessedAttachment(img)
      && (hoveredMapImage && img.body.id == hoveredMapImage
        || (alwaysHighlightImage
          && shownImages.includes(img.body.id || 0))))[0];
  const filteredImages = images.slice().reverse()
    .filter(img =>
      (rangeOverride && shownImages.includes(img.body.id || 0))
      || imageInRange(img, imageFilterBegin, imageFilterEnd).value)
    .filter(img => notHidden(
      hiddenImages, shownImages, hideUnShownImages, img.body.id).value)
    .filter(img => filterImagesByType(designer)(img).value)
    .filter(hasProcessedAttachment)
    .filter(img => !hoveredImage || (img.body.id != hoveredImage.body.id))
    .filter(img => cameraZCheck(img.body.meta.z, calibrationZ))
    .map(img => ({ ...img, highlighted: false }));
  if (hoveredImage) {
    filteredImages.push({ ...hoveredImage, highlighted: true });
  }
  return filteredImages;
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
      visible, images, mapTransformProps, cameraCalibrationData,
      getConfigValue, designer,
    } = this.props;
    const cropImages = !!getConfigValue(BooleanSetting.crop_images);
    const clipImageLayer = !!getConfigValue(BooleanSetting.clip_image_layer);
    return <g id="image-layer"
      clipPath={clipImageLayer ? "url(#map-grid-clip-path)" : undefined}>
      {filterImages({
        visible,
        designer,
        images,
        getConfigValue,
        calibrationZ: cameraCalibrationData.calibrationZ,
      })
        .map(img =>
          <MapImage
            image={img}
            key={"image_" + img.body.id}
            hoveredMapImage={designer.hoveredMapImage}
            highlighted={img.highlighted}
            cropImage={cropImages}
            cameraCalibrationData={cameraCalibrationData}
            mapTransformProps={mapTransformProps} />)}
    </g>;
  }
}
