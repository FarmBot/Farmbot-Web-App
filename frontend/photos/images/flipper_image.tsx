import React from "react";
import { FlipperImageProps, FlipperImageState } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { MapImage } from "../../farm_designer/map/layers/images/map_image";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { isBotOriginQuadrant } from "../../farm_designer/interfaces";
import { getCameraCalibrationData } from "../../farm_designer/state_to_props";
import { cloneDeep, isUndefined } from "lodash";
import {
  PLACEHOLDER_FARMBOT, PLACEHOLDER_FARMBOT_DARK, PlaceholderImg,
} from "./image_flipper";
import { Color } from "../../ui";
import { MapTransformProps } from "../../farm_designer/map/interfaces";
import { transformXY } from "../../farm_designer/map/util";
import { BotPosition } from "../../devices/interfaces";

interface TargetProps {
  imageLocation: BotPosition;
  target: Record<"x" | "y", number> | undefined;
  mapTransformProps: MapTransformProps;
  offset: Record<"x" | "y", string | undefined>;
}

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
  };

  Target = (props: TargetProps) => {
    const { imageLocation, target, mapTransformProps, offset } = props;
    if (isUndefined(imageLocation.x) || isUndefined(imageLocation.y) || !target) {
      return <g id={"no-target"} />;
    }
    const { qx, qy } = transformXY(
      target.x - imageLocation.x - parseInt(offset.x || "0"),
      target.y - imageLocation.y - parseInt(offset.y || "0"),
      mapTransformProps);
    const x = qx + (this.state.width || 0) / 2;
    const y = qy + (this.state.height || 0) / 2;
    return <text x={x} y={y} fill={Color.black}
      strokeWidth={0} stroke={Color.yellow}
      fontSize={24} fontWeight={"bold"}
      textAnchor={"middle"} alignmentBaseline={"middle"}>x</text>;
  };

  SvgImage = () => {
    const { getConfigValue } = this.props;
    const rawQuadrant = getConfigValue(NumericSetting.bot_origin_quadrant);
    const mapTransformProps: MapTransformProps = {
      quadrant: isBotOriginQuadrant(rawQuadrant) ? rawQuadrant : 2,
      gridSize: { x: 0, y: 0 },
      xySwap: !!getConfigValue(BooleanSetting.xy_swap),
    };
    const cameraCalibrationData = getCameraCalibrationData(this.props.env);
    cameraCalibrationData.scale = "1";
    const img = cloneDeep(this.props.image);
    img.body.meta.x = 0;
    img.body.meta.y = 0;
    img.body.id = -(this.props.image.body.id || 0);
    const { width, height } = this.state;
    return <svg viewBox={`0 0 ${width || 0} ${height || 0}`}>
      <MapImage
        image={img}
        callback={this.onImageLoad}
        disableTranslation={true}
        hoveredMapImage={undefined}
        highlighted={false}
        cropImage={this.props.crop
          && !!getConfigValue(BooleanSetting.crop_images)}
        cameraCalibrationData={cameraCalibrationData}
        mapTransformProps={mapTransformProps} />
      <this.Target
        imageLocation={this.props.image.body.meta}
        target={this.props.target}
        offset={cameraCalibrationData.offset}
        mapTransformProps={mapTransformProps} />
    </svg>;
  };

  render() {
    const placeholder = this.props.dark
      ? PLACEHOLDER_FARMBOT_DARK
      : PLACEHOLDER_FARMBOT;
    const url = this.props.image.body.attachment_processed_at
      ? this.props.image.body.attachment_url
      : placeholder;
    const { isLoaded } = this.state;
    const flipper = document.getElementById(this.props.flipperId);
    return <div className={"image-jsx"}
      onMouseEnter={() => this.props.hover?.(this.props.image.uuid)}
      onMouseLeave={() => this.props.hover?.(undefined)}>
      {!isLoaded && <PlaceholderImg textOverlay={t("Loading...")}
        dark={this.props.dark}
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
