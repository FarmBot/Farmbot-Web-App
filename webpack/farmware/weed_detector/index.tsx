import * as React from "react";
import { connect } from "react-redux";
import { DetectorState } from "./interfaces";
import { Row, Col } from "../../ui/index";
import { t } from "i18next";
import { deletePoints, scanImage, test } from "./actions";
import { selectImage } from "../images/actions";
import { Progress } from "../../util";
import { FarmwareProps, Feature } from "../../devices/interfaces";
import { mapStateToProps } from "../../farmware/state_to_props";
import { ImageWorkspace } from "./image_workspace";
import { WDENVKey, isWDENVKey } from "./remote_env/interfaces";
import { envGet } from "./remote_env/selectors";
import { MustBeOnline } from "../../devices/must_be_online";
import { envSave } from "./remote_env/actions";

export const namespace = (prefix: string) => (key: string): WDENVKey => {
  const namespacedKey = prefix + key;
  if (isWDENVKey(namespacedKey)) {
    return namespacedKey;
  } else {
    throw new Error(`${namespacedKey} is not a WDENVKey`);
  }
};

@connect(mapStateToProps)
export class WeedDetector
  extends React.Component<FarmwareProps, Partial<DetectorState>> {

  constructor(props: FarmwareProps) {
    super(props);
    this.state = { remoteFarmwareSettings: {} };
  }

  /** Delete all map points created by the Weed Detector. */
  clearWeeds = () => {
    const progress = (p: Readonly<Progress>) => {
      const percentage = `${Math.round((p.completed / p.total) * 100)} %`;
      this.setState({ deletionProgress: p.isDone ? "" : percentage });
    };
    this.props.dispatch(deletePoints(t("weeds"), "plant-detection", progress));
    this.setState({ deletionProgress: t("Deleting...") });
  }

  namespace = namespace("WEED_DETECTOR_");

  change = (key: string, value: number) => {
    this.saveEnvVar(this.namespace(key), value);
  }

  saveEnvVar = (key: WDENVKey, value: number) =>
    this.props.shouldDisplay(Feature.api_farmware_env)
      ? this.props.dispatch(this.props.saveFarmwareEnv(key, "" + value))
      : envSave(key, value)

  render() {
    return <div className="weed-detector">
      <div className="farmware-button">
        <button
          onClick={this.props.dispatch(test)}
          className="fb-button green">
          {t("detect weeds")}
        </button>
        <button
          onClick={this.clearWeeds}
          className="fb-button red">
          {this.state.deletionProgress || t("CLEAR WEEDS")}
        </button>
      </div>
      <Row>
        <Col sm={12}>
          <MustBeOnline
            syncStatus={this.props.syncStatus}
            networkState={this.props.botToMqttStatus}
            lockOpen={process.env.NODE_ENV !== "production"}>
            <ImageWorkspace
              onProcessPhoto={id => this.props.dispatch(scanImage(id))}
              onFlip={uuid => this.props.dispatch(selectImage(uuid))}
              currentImage={this.props.currentImage}
              images={this.props.images}
              onChange={this.change}
              iteration={envGet(this.namespace("iteration"), this.props.env)}
              morph={envGet(this.namespace("morph"), this.props.env)}
              blur={envGet(this.namespace("blur"), this.props.env)}
              H_LO={envGet(this.namespace("H_LO"), this.props.env)}
              H_HI={envGet(this.namespace("H_HI"), this.props.env)}
              S_LO={envGet(this.namespace("S_LO"), this.props.env)}
              S_HI={envGet(this.namespace("S_HI"), this.props.env)}
              V_LO={envGet(this.namespace("V_LO"), this.props.env)}
              V_HI={envGet(this.namespace("V_HI"), this.props.env)} />
          </MustBeOnline>
        </Col>
      </Row>
    </div>;
  }
}
