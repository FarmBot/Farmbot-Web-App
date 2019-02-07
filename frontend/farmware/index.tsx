import * as React from "react";
import { connect } from "react-redux";
import {
  Page, Row, LeftPanel, CenterPanel, RightPanel, DocSlug
} from "../ui/index";
import { mapStateToProps, isPendingInstallation } from "./state_to_props";
import { Photos } from "./images/photos";
import { CameraCalibration } from "./camera_calibration/camera_calibration";
import { FarmwareProps } from "../devices/interfaces";
import { WeedDetector } from "./weed_detector/index";
import { envGet } from "./weed_detector/remote_env/selectors";
import { setActiveFarmwareByName } from "./set_active_farmware_by_name";
import { FarmwareList } from "./farmware_list";
import { t } from "i18next";
import {
  FarmwareForm, needsFarmwareForm, farmwareHelpText
} from "./farmware_forms";
import { urlFriendly } from "../util";
import { history } from "../history";
import { ToolTips } from "../constants";
import { FarmwareInfo } from "./farmware_info";
import { Farmwares } from "./interfaces";
import { commandErr } from "../devices/actions";
import { getDevice } from "../device";
import { FarmwareManifest } from "farmbot";

/** Get the correct help text for the provided Farmware. */
const getToolTipByFarmware =
  (farmwares: Farmwares, farmwareName: string | undefined) => {
    if (farmwareName) {
      switch (urlFriendly(farmwareName).replace("-", "_")) {
        case "take_photo":
        case "photos":
          return ToolTips.PHOTOS;
        case "camera_calibration":
          return ToolTips.CAMERA_CALIBRATION;
        case "plant_detection":
        case "weed_detector":
          return ToolTips.WEED_DETECTOR;
        default:
          return farmwareHelpText(getFarmwareByName(farmwares, farmwareName));
      }
    } else {
      return "";
    }
  };

/** Get a documentation link for the provided Farmware if one exists. */
const getDocLinkByFarmware =
  (farmwareName: string | undefined): DocSlug | undefined => {
    if (farmwareName) {
      switch (urlFriendly(farmwareName).replace("-", "_")) {
        case "camera_calibration":
          return "farmware#section-camera-calibration";
        case "plant_detection":
        case "weed_detector":
          return "farmware#section-weed-detector";
      }
    }
  };

/** Get Farmware details for the provided Farmware name. */
const getFarmwareByName =
  (farmwares: Farmwares, farmwareName: string | undefined) => {
    switch (farmwareName) {
      case "Photos":
        return farmwares["take-photo"];
      case "Camera Calibration":
        return farmwares["camera-calibration"];
      case "Weed Detector":
        return farmwares["plant-detection"];
      default:
        return farmwares[farmwareName || ""];
    }
  };

/** Execute a Farmware. */
const run = (farmwareName: string) => () => {
  getDevice().execScript(farmwareName)
    .then(() => { }, commandErr("Farmware execution"));
};

export const BasicFarmwarePage = ({ farmwareName, farmware }: {
  farmwareName: string,
  farmware: FarmwareManifest | undefined
}) =>
  <div>
    <button
      className="fb-button green farmware-button"
      disabled={isPendingInstallation(farmware)}
      onClick={run(farmwareName)}>
      {t("Run")}
    </button>
    <p>
      {isPendingInstallation(farmware)
        ? t("Pending installation.")
        : t("No inputs provided.")}
    </p>
  </div>;

@connect(mapStateToProps)
export class FarmwarePage extends React.Component<FarmwareProps, {}> {
  get current() { return this.props.currentFarmware; }

  componentWillMount() {
    if (!this.current && Object.values(this.props.farmwares).length > 0) {
      const farmwareNames = Object.values(this.props.farmwares)
        .map(x => x && x.name);
      setActiveFarmwareByName(farmwareNames);
    } else {
      // Farmware information not available. Load default Farmware page.
      history.push("/app/farmware");
    }
  }

  /** Load Farmware input panel contents for 1st & 3rd party Farmware. */
  getPanelByFarmware(farmwareName: string) {
    switch (urlFriendly(farmwareName).replace("-", "_")) {
      case "take_photo":
      case "photos":
        return <Photos
          timeOffset={this.props.timeOffset}
          dispatch={this.props.dispatch}
          images={this.props.images}
          currentImage={this.props.currentImage}
          imageJobs={this.props.imageJobs} />;
      case "camera_calibration":
        return <CameraCalibration
          syncStatus={this.props.syncStatus}
          dispatch={this.props.dispatch}
          currentImage={this.props.currentImage}
          images={this.props.images}
          env={this.props.env}
          saveFarmwareEnv={this.props.saveFarmwareEnv}
          iteration={envGet("CAMERA_CALIBRATION_iteration", this.props.env)}
          morph={envGet("CAMERA_CALIBRATION_morph", this.props.env)}
          blur={envGet("CAMERA_CALIBRATION_blur", this.props.env)}
          H_LO={envGet("CAMERA_CALIBRATION_H_LO", this.props.env)}
          S_LO={envGet("CAMERA_CALIBRATION_S_LO", this.props.env)}
          V_LO={envGet("CAMERA_CALIBRATION_V_LO", this.props.env)}
          H_HI={envGet("CAMERA_CALIBRATION_H_HI", this.props.env)}
          S_HI={envGet("CAMERA_CALIBRATION_S_HI", this.props.env)}
          V_HI={envGet("CAMERA_CALIBRATION_V_HI", this.props.env)}
          timeOffset={this.props.timeOffset}
          shouldDisplay={this.props.shouldDisplay}
          botToMqttStatus={this.props.botToMqttStatus} />;
      case "plant_detection":
      case "weed_detector":
        return <WeedDetector {...this.props} />;
      default:
        const farmware = getFarmwareByName(this.props.farmwares, farmwareName);
        return farmware && needsFarmwareForm(farmware)
          ? <FarmwareForm farmware={farmware}
            user_env={this.props.user_env}
            shouldDisplay={this.props.shouldDisplay}
            saveFarmwareEnv={this.props.saveFarmwareEnv}
            dispatch={this.props.dispatch} />
          : <BasicFarmwarePage
            farmwareName={farmwareName}
            farmware={farmware} />;
    }
  }

  render() {
    const farmware = getFarmwareByName(
      this.props.farmwares, this.current || "take-photo");
    return <Page className="farmware-page">
      <Row>
        <LeftPanel
          className="farmware-list-panel"
          title={t("Farmware")}
          helpText={ToolTips.FARMWARE_LIST}>
          <FarmwareList
            current={this.current}
            dispatch={this.props.dispatch}
            shouldDisplay={this.props.shouldDisplay}
            farmwares={this.props.farmwares}
            installations={this.props.taggedFarmwareInstallations}
            firstPartyFarmwareNames={this.props.firstPartyFarmwareNames}
            showFirstParty={!!this.props.webAppConfig.show_first_party_farmware} />
        </LeftPanel>
        <CenterPanel
          className="farmware-input-panel"
          title={this.current || t("Photos")}
          helpText={getToolTipByFarmware(this.props.farmwares, this.current)
            || ToolTips.PHOTOS}
          docPage={getDocLinkByFarmware(this.current)}>
          {<div className="farmware-input-panel-contents">
            {this.getPanelByFarmware(this.current ? this.current : "photos")}
          </div>}
        </CenterPanel>
        <RightPanel
          className="farmware-info-panel"
          title={t("Information")}
          helpText={ToolTips.FARMWARE_INFO}
          show={!!farmware}>
          <FarmwareInfo
            dispatch={this.props.dispatch}
            farmware={farmware}
            installations={this.props.taggedFarmwareInstallations}
            shouldDisplay={this.props.shouldDisplay}
            firstPartyFarmwareNames={this.props.firstPartyFarmwareNames}
            showFirstParty={!!this.props.webAppConfig.show_first_party_farmware} />
        </RightPanel>
      </Row>
    </Page>;
  }
}
