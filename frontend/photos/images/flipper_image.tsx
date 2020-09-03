import React from "react";
import { FlipperImageProps, FlipperImageState } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { MapImage } from "../../farm_designer/map/layers/images/map_image";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { isBotOriginQuadrant } from "../../farm_designer/interfaces";
import { getCameraCalibrationData } from "../../farm_designer/state_to_props";
import { cloneDeep } from "lodash";
import { PLACEHOLDER_FARMBOT, PlaceholderImg } from "./image_flipper";

export class FlipperImage
  extends React.Component<FlipperImageProps, FlipperImageState> {
  state: FlipperImageState = {
    isLoaded: false,
    width: undefined,
    height: undefined,
  };

  onImageLoad = (img: HTMLImageElement) => {
    this.props.onImageLoad(img);
    this.setState({
      isLoaded: true,
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  }

  SvgImage = () => {
    const { getConfigValue } = this.props;
    const rawQuadrant = getConfigValue(NumericSetting.bot_origin_quadrant);
    const cameraCalibrationData = getCameraCalibrationData(this.props.env);
    cameraCalibrationData.scale = "1";
    const img = cloneDeep(this.props.image);
    img.body.meta.x = 0;
    img.body.meta.y = 0;
    img.body.id = -(this.props.image.body.id || 0);
    const { width, height } = this.state;
    return <svg viewBox={`0 0 ${width} ${height}`}>
      <MapImage
        image={img}
        callback={this.onImageLoad}
        disableTranslation={true}
        hoveredMapImage={undefined}
        highlighted={false}
        cropImage={this.props.crop
          && !!getConfigValue(BooleanSetting.crop_images)}
        cameraCalibrationData={cameraCalibrationData}
        mapTransformProps={{
          quadrant: isBotOriginQuadrant(rawQuadrant) ? rawQuadrant : 2,
          gridSize: { x: 0, y: 0 },
          xySwap: !!getConfigValue(BooleanSetting.xy_swap),
        }} />
    </svg>;
  }

  render() {
    const url = this.props.image.body.attachment_processed_at
      ? this.props.image.body.attachment_url
      : PLACEHOLDER_FARMBOT;
    const { isLoaded } = this.state;
    const flipper = document.getElementById(this.props.flipperId);
    return <div className={"image-jsx"}>
      {!isLoaded && <PlaceholderImg textOverlay={t("Loading...")}
        width={flipper?.clientWidth} height={flipper?.clientHeight} />}
      <div className={"flipper-image"}
        style={isLoaded ? {} : { display: "none" }}>
        {this.props.transformImage
          ? <this.SvgImage />
          : <img className={"image-flipper-image"} src={url}
            onLoad={e => this.onImageLoad(e.currentTarget)} />}
      </div>
    </div>;
  }
}
