import React from "react";
import { connect } from "react-redux";
import { PlantInventoryItem } from "./plant_inventory_item";
import { Everything, PlantsPanelState } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import { getPlants } from "../farm_designer/state_to_props";
import { TaggedPlant } from "../farm_designer/map/interfaces";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content, DeviceSetting } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { SearchField } from "../ui/search_field";
import {
  selectAllActivePoints,
  selectAllPlantPointers,
  selectAllPlantTemplates,
  selectAllPointGroups, selectAllSavedGardens,
} from "../resources/selectors";
import {
  TaggedSavedGarden, TaggedPointGroup, TaggedPoint, TaggedPlantTemplate,
} from "farmbot";
import { GroupInventoryItem } from "../point_groups/group_inventory_item";
import { SavedGardenList } from "../saved_gardens/garden_list";
import { pointGroupSubset, uncategorizedGroupSubset } from "./select_plants";
import { Collapse, Position } from "@blueprintjs/core";
import { createGroup } from "../point_groups/actions";
import { DEFAULT_CRITERIA } from "../point_groups/criteria/interfaces";
import { deletePoints } from "../api/delete_points";
import { Path } from "../internal_urls";
import { WebAppNumberSetting } from "../settings/farm_designer_settings";
import { NumericSetting } from "../session_keys";
import { Help, Popover, Row } from "../ui";
import {
  GetWebAppConfigValue, getWebAppConfigValue,
} from "../config_storage/actions";
import { NavigationContext } from "../routes_helpers";

export interface PlantInventoryProps {
  plants: TaggedPlant[];
  dispatch: Function;
  hoveredPlantListItem: string | undefined;
  savedGardens: TaggedSavedGarden[];
  groups: TaggedPointGroup[];
  allPoints: TaggedPoint[];
  plantTemplates: TaggedPlantTemplate[];
  plantPointerCount: number;
  openedSavedGarden: number | undefined;
  plantsPanelState: PlantsPanelState;
  getConfigValue: GetWebAppConfigValue;
}

interface PlantInventoryState {
  searchTerm: string;
}

export function mapStateToProps(props: Everything): PlantInventoryProps {
  const { hoveredPlantListItem } = props.resources.consumers.farm_designer;
  return {
    plants: getPlants(props.resources),
    dispatch: props.dispatch,
    hoveredPlantListItem,
    groups: selectAllPointGroups(props.resources.index),
    savedGardens: selectAllSavedGardens(props.resources.index),
    allPoints: selectAllActivePoints(props.resources.index),
    plantTemplates: selectAllPlantTemplates(props.resources.index),
    plantPointerCount: selectAllPlantPointers(props.resources.index).length,
    openedSavedGarden: props.resources.consumers.farm_designer.openedSavedGarden,
    plantsPanelState: props.app.plantsPanelState,
    getConfigValue: getWebAppConfigValue(() => props),
  };
}

export class RawPlants
  extends React.Component<PlantInventoryProps, PlantInventoryState> {
  state: PlantInventoryState = {
    searchTerm: "",
  };

  get noResult() {
    return <p>{`${t("Do you want to")} `}
      <a onClick={() => {
        this.props.dispatch({
          type: Actions.SEARCH_QUERY_CHANGE,
          payload: this.state.searchTerm,
        });
        this.navigate(Path.cropSearch());
        this.props.dispatch({ type: Actions.SET_SLUG_BULK, payload: undefined });
      }}>
        {t("search all crops?")}
      </a>
    </p>;
  }

  toggleOpen = (section: keyof PlantsPanelState) => () =>
    this.props.dispatch({
      type: Actions.TOGGLE_PLANTS_PANEL_OPTION, payload: section,
    });

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  navigateById = (id: number | undefined) => () => {
    this.navigate(Path.groups(id));
  };

  render() {
    const { dispatch, plantsPanelState, plants } = this.props;
    const filteredPlants = plants
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    const plantGroups = pointGroupSubset(this.props.groups, "Plant");
    const filteredGroups = plantGroups
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    const uncategorizedGroups = uncategorizedGroupSubset(this.props.groups);
    const noSearchResults = this.state.searchTerm && filteredPlants.length == 0;
    return <DesignerPanel panelName={"plant-inventory"} panel={Panel.Plants}>
      <DesignerPanelTop panel={Panel.Plants} withButton={true}>
        <SearchField nameKey={"plants"}
          searchTerm={this.state.searchTerm}
          placeholder={t("Search your plants...")}
          onChange={searchTerm => this.setState({ searchTerm })} />
        <Popover
          position={Position.BOTTOM}
          popoverClassName={"plants-panel-settings-menu"}
          target={<i className={"fa fa-gear fb-icon-button invert"} />}
          content={<Row>
            <label>{t(DeviceSetting.defaultPlantDepth)}</label>
            <Help text={Content.DEFAULT_PLANT_DEPTH} />
            <WebAppNumberSetting dispatch={dispatch}
              getConfigValue={this.props.getConfigValue}
              numberSetting={NumericSetting.default_plant_depth} />
          </Row>} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"plant"}>
        <PanelSection isOpen={plantsPanelState.groups}
          panel={Panel.Plants}
          toggleOpen={this.toggleOpen("groups")}
          itemCount={plantGroups.length}
          addNew={() => dispatch(createGroup({
            criteria: {
              ...DEFAULT_CRITERIA,
              string_eq: { pointer_type: ["Plant"] },
            },
            navigate: this.navigate,
          }))}
          addTitle={t("add new group")}
          addClassName={"plus-group"}
          title={t("Plant Groups")}>
          <div className={"plant-groups"}>
            {filteredGroups
              .map(group => <GroupInventoryItem
                key={group.uuid}
                group={group}
                allPoints={this.props.allPoints}
                hovered={false}
                dispatch={dispatch}
                onClick={this.navigateById(group.body.id)}
              />)}
          </div>
          {uncategorizedGroups.length > 0
            ? <label style={{ marginLeft: "1rem" }}>{t("uncategorized")}</label>
            : <div />}
          <div className={"uncategorized-groups"}>
            {uncategorizedGroups
              .map(group => <GroupInventoryItem
                key={group.uuid}
                group={group}
                allPoints={this.props.allPoints}
                hovered={false}
                dispatch={dispatch}
                onClick={this.navigateById(group.body.id)}
              />)}
          </div>
        </PanelSection>
        <PanelSection isOpen={plantsPanelState.savedGardens}
          panel={Panel.Plants}
          toggleOpen={this.toggleOpen("savedGardens")}
          itemCount={this.props.savedGardens.length}
          addNew={() => { this.navigate(Path.savedGardens("add")); }}
          addTitle={t("add new saved garden")}
          addClassName={"plus-saved-garden"}
          title={t("Gardens")}>
          <SavedGardenList {...this.props} searchTerm={this.state.searchTerm} />
        </PanelSection>
        <PanelSection isOpen={plantsPanelState.plants}
          panel={Panel.Plants}
          toggleOpen={this.toggleOpen("plants")}
          itemCount={plants.length}
          addNew={() => {
            this.navigate(Path.cropSearch());
            dispatch({ type: Actions.SET_SLUG_BULK, payload: undefined });
          }}
          addTitle={t("add plant")}
          addClassName={"plus-plant"}
          title={t("Plants")}
          extraHeaderContent={
            !this.props.openedSavedGarden && plantsPanelState.plants &&
            <button className={"fb-button red delete"}
              title={t("delete all plants in garden")}
              onClick={e => {
                e.stopPropagation();
                confirm(t("Delete all {{ count }} plants in your main garden?",
                  { count: plants.length })) &&
                  dispatch(deletePoints("plants",
                    { pointer_type: "Plant" }));
              }}>
              {t("delete all")}
            </button>}>
          <EmptyStateWrapper
            notEmpty={plants.length > 0 && !noSearchResults}
            graphic={noSearchResults
              ? EmptyStateGraphic.no_crop_results
              : EmptyStateGraphic.plants}
            title={noSearchResults
              ? t("No results in your garden")
              : t("Get growing!")}
            text={noSearchResults ? undefined : Content.NO_PLANTS}
            textElement={noSearchResults ? this.noResult : undefined}
            colorScheme={"plants"}>
            {filteredPlants.map(p =>
              <PlantInventoryItem
                key={p.uuid}
                plant={p}
                hovered={this.props.hoveredPlantListItem === p.uuid}
                dispatch={dispatch} />)}
          </EmptyStateWrapper>
        </PanelSection>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Plants = connect(mapStateToProps)(RawPlants);
// eslint-disable-next-line import/no-default-export
export default Plants;

export interface PanelSectionProps {
  panel: Panel;
  isOpen: boolean;
  toggleOpen(): void;
  itemCount: number;
  title: string;
  addNew(): void;
  addTitle: string;
  addClassName: string;
  children: React.ReactNode | React.ReactNode[];
  extraHeaderContent?: React.ReactNode | false;
  extraHeaderTitle?: React.ReactNode | false;
}

export const PanelSection = (props: PanelSectionProps) => {
  const { isOpen } = props;
  return <div className={`panel-section ${isOpen ? "open" : ""}`}>
    <div className={"section-header"}
      onClick={props.toggleOpen}>
      <label>{`${props.title} (${props.itemCount})`}</label>
      {props.extraHeaderTitle}
      <div className="row">
        {props.extraHeaderContent}
        {isOpen && <div
          onClick={e => {
            e.stopPropagation();
            props.addNew();
          }}
          className={[
            "fb-button green",
            props.addClassName,
          ].join(" ")}>
          <i className={"fa fa-plus"} title={props.addTitle} />
        </div>}
        <i className={`fa fa-caret-${isOpen ? "up" : "down"}`} />
      </div>
    </div>
    <Collapse isOpen={isOpen}>
      {props.children}
    </Collapse>
  </div>;
};
