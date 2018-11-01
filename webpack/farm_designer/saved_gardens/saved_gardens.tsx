import * as React from "react";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { t } from "i18next";
import { history } from "../../history";
import { unselectPlant } from "../actions";
import {
  selectAllSavedGardens, selectAllPlantTemplates, selectAllPlantPointers
} from "../../resources/selectors";
import { GardenSnapshot } from "./garden_snapshot";
import { SavedGardenList } from "./garden_list";
import { SavedGardensProps } from "./interfaces";
import { closeSavedGarden } from "./actions";
import { TaggedSavedGarden } from "farmbot";

export function mapStateToProps(props: Everything): SavedGardensProps {
  return {
    savedGardens: selectAllSavedGardens(props.resources.index),
    plantTemplates: selectAllPlantTemplates(props.resources.index),
    dispatch: props.dispatch,
    plantsInGarden: selectAllPlantPointers(props.resources.index).length > 0,
    openedSavedGarden: props.resources.consumers.farm_designer.openedSavedGarden,
  };
}

@connect(mapStateToProps)
export class SavedGardens extends React.Component<SavedGardensProps, {}> {

  componentDidMount() {
    unselectPlant(this.props.dispatch)();
  }

  get currentSavedGarden(): TaggedSavedGarden | undefined {
    return this.props.savedGardens
      .filter(x => x.uuid === this.props.openedSavedGarden)[0];
  }

  render() {
    return <div
      className="panel-container green-panel saved-garden-panel">
      <div className="panel-header green-panel">
        <p className="panel-title">
          <i className="fa fa-arrow-left plant-panel-back-arrow"
            onClick={() => history.push("/app/designer/plants")} />
          {t("Saved Gardens")}
        </p>

        <div className="panel-header-description">
          {t("Save or load a garden.")}
        </div>
      </div>

      <div className="panel-content saved-garden-panel-content">
        <GardenSnapshot
          plantsInGarden={this.props.plantsInGarden}
          currentSavedGarden={this.currentSavedGarden}
          plantTemplates={this.props.plantTemplates}
          dispatch={this.props.dispatch} />
        <hr />
        {this.props.savedGardens.length > 0
          ? <SavedGardenList {...this.props} />
          : <p>{t("No saved gardens yet.")}</p>}
      </div>
    </div>;
  }
}

export const SavedGardensLink = () =>
  <button className="fb-button green"
    hidden={!(localStorage.getItem("FUTURE_FEATURES"))}
    onClick={() => history.push("/app/designer/saved_gardens")}>
    {t("Saved Gardens")}
  </button>;

export const savedGardenOpen = (pathArray: string[]) =>
  pathArray[3] === "saved_gardens" && parseInt(pathArray[4]) > 0
    ? parseInt(pathArray[4]) : false;

export const SavedGardenHUD = (props: { dispatch: Function }) =>
  <div className="saved-garden-indicator">
    <label>{t("Viewing saved garden")}</label>
    <button className="fb-button gray"
      onClick={() => history.push("/app/designer/saved_gardens")}>
      {t("Menu")}
    </button>
    <button className="fb-button green"
      onClick={() => {
        history.push("/app/designer/plants");
        unselectPlant(props.dispatch)();
      }}>
      {t("Edit")}
    </button>
    <button className="fb-button red"
      onClick={() => props.dispatch(closeSavedGarden())}>
      {t("Exit")}
    </button>
  </div>;
