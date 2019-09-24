import * as React from "react";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
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
import { Content } from "../../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../plants/designer_panel";
import { DevSettings } from "../../account/dev/dev_support";
import { DesignerNavTabs } from "../panel_header";
import { t } from "../../i18next_wrapper";
import { EmptyStateWrapper, EmptyStateGraphic } from "../../ui/empty_state_wrapper";

export const mapStateToProps = (props: Everything): SavedGardensProps => ({
  savedGardens: selectAllSavedGardens(props.resources.index),
  plantTemplates: selectAllPlantTemplates(props.resources.index),
  dispatch: props.dispatch,
  plantPointerCount: selectAllPlantPointers(props.resources.index).length,
  openedSavedGarden: props.resources.consumers.farm_designer.openedSavedGarden,
});

export class RawSavedGardens extends React.Component<SavedGardensProps, {}> {

  componentDidMount() {
    unselectPlant(this.props.dispatch)();
  }

  get currentSavedGarden(): TaggedSavedGarden | undefined {
    return this.props.savedGardens
      .filter(x => x.uuid === this.props.openedSavedGarden)[0];
  }

  render() {
    const alt = DevSettings.futureFeaturesEnabled();
    return <DesignerPanel panelName={"saved-garden"} panelColor={"green"}>
      {alt ? <DesignerNavTabs /> :
        <DesignerPanelHeader
          panelName={"saved-garden"}
          panelColor={"green"}
          title={t("Saved Gardens")}
          description={Content.SAVED_GARDENS}
          backTo={"/app/designer/plants"} />}
      <DesignerPanelContent panelName={"saved-garden"}
        className={`${alt ? "with-nav" : ""}`}>
        {alt && <p>{t(Content.SAVED_GARDENS)}</p>}
        <GardenSnapshot
          currentSavedGarden={this.currentSavedGarden}
          plantTemplates={this.props.plantTemplates}
          dispatch={this.props.dispatch} />
        <hr />
        <EmptyStateWrapper
          notEmpty={this.props.savedGardens.length > 0}
          title={t("No saved gardens yet.")}
          // text={t(Content.NO_GARDENS)}
          colorScheme="gardens"
          graphic={EmptyStateGraphic.plants}>
          <SavedGardenList {...this.props} />
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

/** Link to SavedGardens panel for garden map legend. */
export const SavedGardensLink = () =>
  <button className="fb-button green"
    hidden={true}
    onClick={() => history.push("/app/designer/saved_gardens")}>
    {t("Saved Gardens")}
  </button>;

/** Check if a SavedGarden is currently open (URL approach). */
export const savedGardenOpen = (pathArray: string[]) =>
  pathArray[3] === "saved_gardens" && parseInt(pathArray[4]) > 0
    ? parseInt(pathArray[4]) : false;

/** Sticky an indicator and actions menu when a SavedGarden is open. */
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

export const SavedGardens = connect(mapStateToProps)(RawSavedGardens);
