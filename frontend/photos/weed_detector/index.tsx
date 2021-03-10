import React from "react";
import { WeedDetectorState, WeedDetectorProps } from "./interfaces";
import { Row, Col } from "../../ui";
import { scanImage, detectPlants } from "./actions";
import { deletePoints } from "../../api/delete_points";
import { Progress } from "../../util";
import { ImageWorkspace, NumericKeyName } from "../image_workspace";
import { WDENVKey } from "../remote_env/interfaces";
import { namespace, WEED_DETECTOR_KEY_PART } from "../remote_env/constants";
import { envGet } from "../remote_env/selectors";
import { MustBeOnline, isBotOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../capture_settings/camera_selection";

export class WeedDetector
  extends React.Component<WeedDetectorProps, Partial<WeedDetectorState>> {

  constructor(props: WeedDetectorProps) {
    super(props);
    this.state = { remoteFarmwareSettings: {} };
  }

  /** Delete all map points created by the Weed Detector. */
  clearWeeds = () => {
    const progress = (p: Readonly<Progress>) => {
      const percentage = `${Math.round((p.completed / p.total) * 100)} %`;
      this.setState({ deletionProgress: p.isDone ? "" : percentage });
    };
    this.props.dispatch(deletePoints(t("weeds"),
      { meta: { created_by: "plant-detection" } }, progress));
    this.setState({ deletionProgress: t("Deleting...") });
  }

  namespace = namespace<WEED_DETECTOR_KEY_PART>("WEED_DETECTOR_");

  change = (key: NumericKeyName, value: number) => {
    this.saveEnvVar(this.namespace(key), value);
  }

  saveEnvVar = (key: WDENVKey, value: number) =>
    this.props.dispatch(this.props.saveFarmwareEnv(key, "" + value))

  render() {
    const wDEnvGet = (key: WDENVKey) => envGet(key, this.props.wDEnv);
    const camDisabled = cameraBtnProps(this.props.env);
    return <div className="weed-detector">
      <div className="farmware-button">
        <MustBeOnline
          syncStatus={this.props.syncStatus}
          networkState={this.props.botToMqttStatus}
          hideBanner={true}>
          <button
            className={`fb-button green ${camDisabled.class}`}
            title={camDisabled.title}
            onClick={camDisabled.click ||
              detectPlants(wDEnvGet("CAMERA_CALIBRATION_coord_scale"))}>
            {t("detect weeds")}
          </button>
        </MustBeOnline>
        <button
          title={t("clear weeds")}
          onClick={this.clearWeeds}
          className="fb-button red">
          {this.state.deletionProgress || t("CLEAR WEEDS")}
        </button>
      </div>
      <Row>
        <Col sm={12}>
          <ImageWorkspace
            botOnline={
              isBotOnline(this.props.syncStatus, this.props.botToMqttStatus)}
            onProcessPhoto={scanImage(wDEnvGet("CAMERA_CALIBRATION_coord_scale"))}
            currentImage={this.props.currentImage}
            images={this.props.images}
            onChange={this.change}
            timeSettings={this.props.timeSettings}
            showAdvanced={this.props.showAdvanced}
            namespace={this.namespace}
            iteration={wDEnvGet(this.namespace("iteration"))}
            morph={wDEnvGet(this.namespace("morph"))}
            blur={wDEnvGet(this.namespace("blur"))}
            H_LO={wDEnvGet(this.namespace("H_LO"))}
            H_HI={wDEnvGet(this.namespace("H_HI"))}
            S_LO={wDEnvGet(this.namespace("S_LO"))}
            S_HI={wDEnvGet(this.namespace("S_HI"))}
            V_LO={wDEnvGet(this.namespace("V_LO"))}
            V_HI={wDEnvGet(this.namespace("V_HI"))} />
        </Col>
      </Row>
    </div>;
  }
}
