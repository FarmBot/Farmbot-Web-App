import React from "react";
import { DeviceSetting, ToolTips } from "../../constants";
import { t } from "../../i18next_wrapper";
import { Help, BlurableInput, Row, Col, FBSelect, DropDownItem } from "../../ui";
import { CaptureSizeSelectionProps, CaptureSizeSelectionState } from "./interfaces";
import { Camera, parseCameraSelection } from "./camera_selection";
import { getModifiedClassNameSpecifyDefault } from "../../settings/default_values";
import { Highlight } from "../../settings/maybe_highlight";
import { Path } from "../../internal_urls";
import { UserEnv } from "../../devices/interfaces";

const getCurrentSizeSetting =
  (env: UserEnv): Record<"width" | "height", string> => ({
    width: env["take_photo_width"] || "640",
    height: env["take_photo_height"] || "480",
  });

export const PhotoResolutionSettingChanged =
  (props: CaptureSizeSelectionProps) => {
    const { env, dispatch, saveFarmwareEnv } = props;
    const { width, height } = getCurrentSizeSetting(env);
    const selectedLongEdge = Math.max(parseInt(width), parseInt(height));
    const calibratedX = env["CAMERA_CALIBRATION_center_pixel_location_x"];
    const calibratedY = env["CAMERA_CALIBRATION_center_pixel_location_y"];
    const calibratedWidth = calibratedX && parseInt(calibratedX) * 2;
    const calibratedHeight = calibratedY && parseInt(calibratedY) * 2;
    const calibratedLongEdge = calibratedWidth && calibratedHeight &&
      Math.max(calibratedWidth, calibratedHeight);
    const sizeDifference = calibratedLongEdge &&
      calibratedLongEdge != selectedLongEdge;
    const options = SIZE_OPTIONS(parseCameraSelection(env));
    const valueGuess = Object.values(options).map(ddi => ddi.value)
      .filter(value => ("" + value).startsWith("" + calibratedLongEdge))[0];
    const ddiGuess = options[valueGuess as Size];
    const sizeGuess = SIZES[valueGuess as Size];

    return <div className={"resolution-change-warning"}>
      {sizeDifference && <i className={"fa fa-exclamation-triangle"}></i>}
      {sizeDifference && <p>
        {t("The camera was previously calibrated for a different resolution.")}
      </p>}
      {sizeDifference && <p>
        {t("Calibrate the camera again for the selected resolution.")}
      </p>}
      {sizeDifference && ddiGuess && <p
        className={"click"}
        onClick={() => {
          dispatch(saveFarmwareEnv("take_photo_width", "" + sizeGuess.width));
          dispatch(saveFarmwareEnv("take_photo_height", "" + sizeGuess.height));
        }}>
        {t("Alternatively, revert to the previous resolution")}: {ddiGuess.label}.
      </p>}
    </div>;
  };

export class CaptureSizeSelection
  extends React.Component<CaptureSizeSelectionProps, CaptureSizeSelectionState> {
  state: CaptureSizeSelectionState = { custom: false };

  render() {
    const { env, dispatch, saveFarmwareEnv } = this.props;
    const { width, height } = getCurrentSizeSetting(env);
    const selectedSize = getSelection(width, height);

    return <Highlight settingName={DeviceSetting.imageResolution}
      pathPrefix={Path.photos}>
      <div className={"image-size-inputs"}>
        <Row>
          <Col xs={5}>
            <label>{t("resolution")}</label>
            <Help text={ToolTips.IMAGE_RESOLUTION} />
          </Col>
          <Col xs={7}>
            <FBSelect
              key={selectedSize.value}
              extraClass={getModifiedClassNameSpecifyDefault(
                selectedSize.value, Size.r640x480)}
              list={Object.values(SIZE_OPTIONS(parseCameraSelection(env)))
                .filter(ddi => !!ddi)
                .map((ddi: DropDownItem) => ddi)}
              selectedItem={selectedSize}
              onChange={ddi => {
                if (ddi.value == Size.custom) {
                  this.setState({ custom: true });
                  return;
                } else {
                  this.setState({ custom: false });
                }
                const size = SIZES[ddi.value as Size];
                dispatch(saveFarmwareEnv("take_photo_width", "" + size.width));
                dispatch(saveFarmwareEnv("take_photo_height", "" + size.height));
              }} />
          </Col>
        </Row>
        <PhotoResolutionSettingChanged {...this.props} />
        {(this.state.custom || selectedSize.value == Size.custom) &&
          <div className={"size-inputs"}>
            <Row>
              <Col xs={4} xsOffset={1}>
                <label>{t("width")}</label>
              </Col>
              <Col xs={7}>
                <BlurableInput type="number"
                  value={width}
                  onCommit={e => dispatch(saveFarmwareEnv(
                    "take_photo_width", e.currentTarget.value))} />
              </Col>
            </Row>
            <Row>
              <Col xs={4} xsOffset={1}>
                <label>{t("height")}</label>
              </Col>
              <Col xs={7}>
                <BlurableInput type="number"
                  value={height}
                  onCommit={e => dispatch(saveFarmwareEnv(
                    "take_photo_height", e.currentTarget.value))} />
              </Col>
            </Row>
          </div>}
      </div>
    </Highlight>;
  }
}

const getSelection = (width: string, height: string): DropDownItem => {
  if (parseInt(width) > 5000 && parseInt(height) > 5000) { return MAXIMUM(); }
  const sizeOption: DropDownItem | undefined =
    SIZE_OPTIONS()[`${width}x${height}` as Size];
  return sizeOption || CUSTOM();
};

enum Size {
  maximum = "maximum",
  custom = "custom",
  r320x240 = "320x240",
  r640x480 = "640x480",
  r800x600 = "800x600",
  r1280x960 = "1280x960",
  r1600x1200 = "1600x1200",
  r2592x1944 = "2592x1944",
  r3280x2464 = "3280x2464",
  r4056x3040 = "4056x3040",
}

const MAXIMUM = () => ({ label: t("Maximum"), value: Size.maximum });
const CUSTOM = () => ({ label: t("Custom"), value: Size.custom });

type Options = Partial<Record<Size, DropDownItem>>;
const SIZE_OPTIONS = (camera = Camera.RPI): Options => {
  const OPTIONS: Options = {
    [Size.maximum]: MAXIMUM(),
    [Size.custom]: CUSTOM(),
    [Size.r320x240]: { label: t("320 x 240 (0.08MP)"), value: Size.r320x240 },
    [Size.r640x480]: { label: t("640 x 480 (0.3MP)"), value: Size.r640x480 },
    [Size.r800x600]: { label: t("800 x 600 (0.5MP)"), value: Size.r800x600 },
    [Size.r1280x960]: { label: t("1280 x 960 (1.3MP)"), value: Size.r1280x960 },
    [Size.r1600x1200]: { label: t("1600 x 1200 (2MP)"), value: Size.r1600x1200 },
  };
  if (camera == Camera.RPI) {
    OPTIONS[Size.r2592x1944] = {
      label: t("2592 x 1944 (5MP)"), value: Size.r2592x1944,
    };
    OPTIONS[Size.r3280x2464] = {
      label: t("3280 x 2464 (8MP)"), value: Size.r3280x2464,
    };
    OPTIONS[Size.r4056x3040] = {
      label: t("4056 x 3040 (12.3MP)"), value: Size.r4056x3040,
    };
  }
  return OPTIONS;
};

const SIZES: Record<Size, Record<"width" | "height", number>> = {
  [Size.maximum]: { width: 10000, height: 10000 },
  [Size.custom]: { width: 0, height: 0 },
  [Size.r320x240]: { width: 320, height: 240 },
  [Size.r640x480]: { width: 640, height: 480 },
  [Size.r800x600]: { width: 800, height: 600 },
  [Size.r1280x960]: { width: 1280, height: 960 },
  [Size.r1600x1200]: { width: 1600, height: 1200 },
  [Size.r2592x1944]: { width: 2592, height: 1944 },
  [Size.r3280x2464]: { width: 3280, height: 2464 },
  [Size.r4056x3040]: { width: 4056, height: 3040 },
};
