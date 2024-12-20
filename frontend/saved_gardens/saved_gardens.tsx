import React from "react";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { unselectPlant } from "../farm_designer/map/actions";
import {
  selectAllSavedGardens, selectAllPlantTemplates, selectAllPlantPointers,
} from "../resources/selectors";
import { SavedGardenList } from "./garden_list";
import { SavedGardensProps, SavedGardensState } from "./interfaces";
import { closeSavedGarden } from "./actions";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { t } from "../i18next_wrapper";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Content } from "../constants";
import { SearchField } from "../ui/search_field";
import { Path } from "../internal_urls";

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

  render() {
    return <DesignerPanel panelName={"saved-garden"} panel={Panel.SavedGardens}>
      <DesignerPanelContent panelName={"saved-garden"}>
        <DesignerPanelTop
          panel={Panel.SavedGardens}
          linkTo={Path.savedGardens("add")}
          title={t("Add garden")}>
          <SearchField nameKey={"gardens"}
            searchTerm={this.state.searchTerm}
            placeholder={t("Search your gardens...")}
            onChange={searchTerm => this.setState({ searchTerm })} />
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

/** Sticky an indicator and actions menu when a SavedGarden is open. */
export const SavedGardenHUD = (props: { dispatch: Function }) => {
  const navigate = useNavigate();
  return <div className="saved-garden-indicator">
    <label>{t("Viewing saved garden")}</label>
    <button className="fb-button green"
      title={t("open plants panel")}
      onClick={() => {
        navigate(Path.plants());
        unselectPlant(props.dispatch)();
      }}>
      {t("Edit")}
    </button>
    <button className="fb-button red"
      title={t("close saved garden")}
      onClick={() => props.dispatch(closeSavedGarden(navigate))}>
      {t("Exit")}
    </button>
  </div>;
};

export const SavedGardens = connect(mapStateToProps)(RawSavedGardens);
// eslint-disable-next-line import/no-default-export
export default SavedGardens;
