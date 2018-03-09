import * as React from "react";
import { connect } from "react-redux";
import { DetectorState, HSV } from "./interfaces";
import { TitleBar } from "./title";
import { Row, Col, Widget, WidgetBody } from "../../ui/index";
import { t } from "i18next";
import { deletePoints, scanImage, test } from "./actions";
import { selectImage } from "../images/actions";
import { Progress, catchErrors } from "../../util";
import { FarmwareProps } from "../../devices/interfaces";
import { mapStateToProps } from "../../farmware/state_to_props";
import { ToolTips } from "../../constants";
import { ImageWorkspace } from "./image_workspace";
import { WDENVKey as ENVKey } from "./remote_env/interfaces";
import { envGet } from "./remote_env/selectors";
import { translateImageWorkspaceAndSave } from "./actions";
import { MustBeOnline } from "../../devices/must_be_online";

@connect(mapStateToProps)
export class WeedDetector
  extends React.Component<FarmwareProps, Partial<DetectorState>> {
  componentDidCatch(x: Error, y: React.ErrorInfo) { catchErrors(x, y); }

  constructor(props: FarmwareProps) {
    super(props);
    this.state = { remoteFarmwareSettings: {} };
  }

  clearWeeds = () => {
    const progress = (p: Readonly<Progress>) => {
      const percentage = `${Math.round((p.completed / p.total) * 100)} %`;
      this.setState({ deletionProgress: p.isDone ? "" : percentage });
    };
    this.props.dispatch(deletePoints("weeds", "plant-detection", progress));
    this.setState({ deletionProgress: "Deleting..." });
  }

  /** Mapping of HSV values to FBOS Env variables. */
  CHANGE_MAP: Record<HSV, [ENVKey, ENVKey]> = {
    H: ["CAMERA_CALIBRATION_H_LO", "CAMERA_CALIBRATION_H_HI"],
    S: ["CAMERA_CALIBRATION_S_LO", "CAMERA_CALIBRATION_S_HI"],
    V: ["CAMERA_CALIBRATION_V_LO", "CAMERA_CALIBRATION_V_LO"]
  };

  /** Maps <ImageWorkspace/> props to weed detector ENV vars. */
  translateValueAndSave = translateImageWorkspaceAndSave({
    "iteration": "WEED_DETECTOR_iteration",
    "morph": "WEED_DETECTOR_morph",
    "blur": "WEED_DETECTOR_blur",
    "H_HI": "WEED_DETECTOR_H_HI",
    "H_LO": "WEED_DETECTOR_H_LO",
    "S_HI": "WEED_DETECTOR_S_HI",
    "S_LO": "WEED_DETECTOR_S_LO",
    "V_HI": "WEED_DETECTOR_V_HI",
    "V_LO": "WEED_DETECTOR_V_LO"
  });

  render() {
    const classname = "weed-detector-widget";
    return <Widget className={classname}>
      <TitleBar
        onDeletionClick={this.clearWeeds}
        deletionProgress={this.state.deletionProgress}
        onTest={this.props.dispatch(test)}
        title={t("Weed Detector")}
        help={ToolTips.WEED_DETECTOR}
        docs={"farmware#section-camera-calibration"} />
      <WidgetBody>
        <Row>
          <Col sm={12}>
            <MustBeOnline
              syncStatus={this.props.syncStatus}
              networkState={this.props.botToMqttStatus}
              lockOpen={process.env.NODE_ENV !== "production"}>
              <ImageWorkspace
                onProcessPhoto={(id) => { this.props.dispatch(scanImage(id)); }}
                onFlip={(uuid) => this.props.dispatch(selectImage(uuid))}
                currentImage={this.props.currentImage}
                images={this.props.images}
                onChange={this.translateValueAndSave}
                iteration={envGet("WEED_DETECTOR_iteration", this.props.env)}
                morph={envGet("WEED_DETECTOR_morph", this.props.env)}
                blur={envGet("WEED_DETECTOR_blur", this.props.env)}
                H_LO={envGet("WEED_DETECTOR_H_LO", this.props.env)}
                H_HI={envGet("WEED_DETECTOR_H_HI", this.props.env)}
                S_LO={envGet("WEED_DETECTOR_S_LO", this.props.env)}
                S_HI={envGet("WEED_DETECTOR_S_HI", this.props.env)}
                V_LO={envGet("WEED_DETECTOR_V_LO", this.props.env)}
                V_HI={envGet("WEED_DETECTOR_V_HI", this.props.env)} />
            </MustBeOnline>
          </Col>
        </Row>
      </WidgetBody>
    </Widget>;
  }
}
