import * as React from "react";
import { t } from "i18next";
import { urlFriendly } from "../util";
import { Actions } from "../constants";
import { Farmwares } from "./interfaces";
import { getDevice } from "../device";
import { commandErr } from "../devices/actions";
import { FarmwareConfigMenu } from "./farmware_config_menu";
import { every, Dictionary } from "lodash";
import { Popover, Position } from "@blueprintjs/core";
import { Link } from "../link";
import { ShouldDisplay, Feature } from "../devices/interfaces";
import { initSave } from "../api/crud";
import { TaggedFarmwareInstallation } from "farmbot";

const DISPLAY_NAMES: Dictionary<string> = {
  "Photos": t("Photos"),
  "Camera Calibration": t("Camera Calibration"),
  "Weed Detector": t("Weed Detector"),
};

/** Farmware list links: selected or unselected. */
const farmwareListItem = (dispatch: Function, current: string | undefined) =>
  (farmwareName: string) => {
    const click = () => dispatch({
      type: Actions.SELECT_FARMWARE,
      payload: farmwareName
    });
    const selected = (farmwareName == current)
      || (!current && farmwareName == "Photos")
      ? "selected" : "";
    const displayName = Object.keys(DISPLAY_NAMES).includes(farmwareName)
      ? DISPLAY_NAMES[farmwareName]
      : farmwareName;
    return <Link
      to={`/app/farmware/${urlFriendly(farmwareName)}`}
      key={farmwareName}
      onClick={click}>
      <div className={`farmware-list-items ${selected}`} >
        <p>{displayName}</p>
      </div>
    </Link>;
  };

export interface FarmwareListProps {
  current: string | undefined;
  dispatch: Function;
  farmwares: Farmwares;
  showFirstParty: boolean;
  firstPartyFarmwareNames: string[];
  shouldDisplay: ShouldDisplay;
  installations: TaggedFarmwareInstallation[];
}

interface FarmwareListState {
  packageUrl: string;
}

export class FarmwareList
  extends React.Component<FarmwareListProps, FarmwareListState> {
  state: FarmwareListState = { packageUrl: "" };

  clearUrl = () => this.setState({ packageUrl: "" });

  install = () => {
    const url = this.state.packageUrl;
    if (url) {
      this.props.shouldDisplay(Feature.api_farmware_installations)
        ? this.props.dispatch(initSave("FarmwareInstallation",
          { url, package: undefined, package_error: undefined }))
          .then(this.clearUrl)
        : getDevice()
          .installFarmware(url)
          .then(this.clearUrl)
          .catch(commandErr("Farmware installation"));
    } else {
      alert(t("Enter a URL"));
    }
  }

  firstPartyFarmwaresPresent = (firstPartyList: string[] | undefined) => {
    const farmwareList = Object.values(this.props.farmwares).map(x => x.name);
    const allPresent = every(firstPartyList, fw => farmwareList.includes(fw));
    return allPresent;
  }

  render() {
    const { current, dispatch, farmwares, showFirstParty, firstPartyFarmwareNames
    } = this.props;
    const listed1stPartyNames =
      ["take-photo", "camera-calibration", "plant-detection"];
    const farmwareNames = Object.values(farmwares).map(fw => fw.name)
      .filter(x => showFirstParty || !firstPartyFarmwareNames.includes(x))
      .filter(x => !listed1stPartyNames.includes(x));

    return <div>
      <div className="farmware-settings-menu">
        <Popover position={Position.BOTTOM_RIGHT}>
          <i className="fa fa-gear dark" />
          <FarmwareConfigMenu
            show={this.props.showFirstParty}
            shouldDisplay={this.props.shouldDisplay}
            dispatch={this.props.dispatch}
            firstPartyFwsInstalled={
              this.firstPartyFarmwaresPresent(
                this.props.firstPartyFarmwareNames)} />
        </Popover>
      </div>
      {["Photos", "Camera Calibration", "Weed Detector"]
        .map(farmwareListItem(dispatch, current))}
      <hr />
      <label>
        {t("My Farmware")}
      </label>
      {farmwareNames.map(farmwareListItem(dispatch, current))}
      <hr />
      <label>
        {t("Install new Farmware")}
      </label>
      <fieldset>
        <input type="url"
          placeholder={"https://...."}
          value={this.state.packageUrl || ""}
          onChange={e => this.setState({ packageUrl: e.currentTarget.value })} />
        <button
          className="fb-button green"
          onClick={this.install}>
          {t("Install")}
        </button>
      </fieldset>
    </div>;
  }
}
