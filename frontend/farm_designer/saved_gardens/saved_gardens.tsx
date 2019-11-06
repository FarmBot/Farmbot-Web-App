import * as React from "react";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { history } from "../../history";
import { unselectPlant } from "../actions";
import {
  selectAllSavedGardens, selectAllPlantTemplates, selectAllPlantPointers
} from "../../resources/selectors";
import { SavedGardenList } from "./garden_list";
import { SavedGardensProps, SavedGardensState } from "./interfaces";
import { closeSavedGarden } from "./actions";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop
} from "../plants/designer_panel";
import { DesignerNavTabs, Panel } from "../panel_header";
import { t } from "../../i18next_wrapper";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";

export const mapStateToProps = (props: Everything): SavedGardensProps => ({
  savedGardens: selectAllSavedGardens(props.resources.index),
  plantTemplates: selectAllPlantTemplates(props.resources.index),
  dispatch: props.dispatch,
  plantPointerCount: selectAllPlantPointers(props.resources.index).length,
  openedSavedGarden: props.resources.consumers.farm_designer.openedSavedGarden,
});

export class RawSavedGardens
  extends React.Component<SavedGardensProps, SavedGardensState> {
  state: SavedGardensState = { searchTerm: "" };

  componentDidMount() {
    unselectPlant(this.props.dispatch)();
  }

  onChange = (e: React.SyntheticEvent<HTMLInputElement>) =>
    this.setState({ searchTerm: e.currentTarget.value });

  render() {
    return <DesignerPanel panelName={"saved-garden"} panel={Panel.SavedGardens}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"saved-garden"}>
        <DesignerPanelTop
          panel={Panel.SavedGardens}
          linkTo={"/app/designer/gardens/add"}
          title={t("Add garden")}>
          <input type="text" onChange={this.onChange}
            placeholder={t("Search your gardens...")} />
        </DesignerPanelTop>
        <EmptyStateWrapper
          notEmpty={this.props.savedGardens.length > 0}
          title={t("No saved gardens yet.")}
          text={t(Content.NO_GARDENS)}
          colorScheme="gardens"
          graphic={EmptyStateGraphic.plants}>
          <SavedGardenList {...this.props} searchTerm={this.state.searchTerm} />
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

/** Link to SavedGardens panel for garden map legend. */
export const SavedGardensLink = () =>
  <button className="fb-button green"
    hidden={true}
    onClick={() => history.push("/app/designer/gardens")}>
    {t("Saved Gardens")}
  </button>;

/** Check if a SavedGarden is currently open (URL approach). */
export const savedGardenOpen = (pathArray: string[]) =>
  pathArray[3] === "gardens" && parseInt(pathArray[4]) > 0
    ? parseInt(pathArray[4]) : false;

/** Sticky an indicator and actions menu when a SavedGarden is open. */
export const SavedGardenHUD = (props: { dispatch: Function }) =>
  <div className="saved-garden-indicator">
    <label>{t("Viewing saved garden")}</label>
    <button className="fb-button gray"
      onClick={() => history.push("/app/designer/gardens")}>
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
