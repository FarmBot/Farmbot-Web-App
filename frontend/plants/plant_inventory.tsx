import React from "react";
import { connect } from "react-redux";
import { PlantInventoryItem } from "./plant_inventory_item";
import { Everything } from "../interfaces";
import { Panel, DesignerNavTabs, TAB_COLOR } from "../farm_designer/panel_header";
import { getPlants } from "../farm_designer/state_to_props";
import { TaggedPlant } from "../farm_designer/map/interfaces";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { SearchField } from "../ui/search_field";
import { push } from "../history";
import { cropSearchUrl } from "./crop_catalog";
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
import { pointGroupSubset } from "./select_plants";
import { Collapse } from "@blueprintjs/core";
import { createGroup } from "../point_groups/actions";
import { DEFAULT_CRITERIA } from "../point_groups/criteria/interfaces";
import { deletePoints } from "../api/delete_points";

export interface PlantInventoryProps {
  plants: TaggedPlant[];
  dispatch: Function;
  hoveredPlantListItem: string | undefined;
  savedGardens: TaggedSavedGarden[];
  groups: TaggedPointGroup[];
  allPoints: TaggedPoint[];
  plantTemplates: TaggedPlantTemplate[];
  plantPointerCount: number;
  openedSavedGarden: string | undefined;
}

interface PlantInventoryState {
  searchTerm: string;
  plants: boolean;
  groups: boolean;
  savedGardens: boolean;
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
  };
}

export class RawPlants
  extends React.Component<PlantInventoryProps, PlantInventoryState> {
  state: PlantInventoryState = {
    searchTerm: "",
    plants: true,
    groups: false,
    savedGardens: false,
  };

  get noResult() {
    return <p>{`${t("Do you want to")} `}
      <a onClick={() => {
        this.props.dispatch({
          type: Actions.SEARCH_QUERY_CHANGE,
          payload: this.state.searchTerm,
        });
        push(cropSearchUrl());
      }}>
        {t("search all crops?")}
      </a>
    </p>;
  }

  toggleOpen = (key: keyof PlantInventoryState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });

  navigate = (id: number | undefined) => () => push(`/app/designer/groups/${id}`);

  render() {
    const filteredPlants = this.props.plants
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    const plantGroups = pointGroupSubset(this.props.groups, "Plant");
    const filteredGroups = plantGroups
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    const noSearchResults = this.state.searchTerm && filteredPlants.length == 0;
    return <DesignerPanel panelName={"plant-inventory"} panel={Panel.Plants}>
      <DesignerNavTabs />
      <DesignerPanelTop panel={Panel.Plants}>
        <SearchField searchTerm={this.state.searchTerm}
          placeholder={t("Search your plants...")}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"plant"}>
        <PanelSection isOpen={this.state.groups} panel={Panel.Plants}
          toggleOpen={this.toggleOpen("groups")}
          itemCount={plantGroups.length}
          addNew={() => this.props.dispatch(createGroup({
            criteria: {
              ...DEFAULT_CRITERIA,
              string_eq: { pointer_type: ["Plant"] },
            },
          }))}
          addTitle={t("add new group")}
          addClassName={"plus-group"}
          title={t("Plant Groups")}>
          {filteredGroups
            .map(group => <GroupInventoryItem
              key={group.uuid}
              group={group}
              allPoints={this.props.allPoints}
              hovered={false}
              dispatch={this.props.dispatch}
              onClick={this.navigate(group.body.id)}
            />)}
        </PanelSection>
        <PanelSection isOpen={this.state.savedGardens} panel={Panel.Plants}
          toggleOpen={this.toggleOpen("savedGardens")}
          itemCount={this.props.savedGardens.length}
          addNew={() => push("/app/designer/gardens/add")}
          addTitle={t("add new saved garden")}
          addClassName={"plus-saved-garden"}
          title={t("Gardens")}>
          <button className={"fb-button red delete"}
            title={t("delete all plants in active garden")}
            onClick={() =>
              confirm(t("Delete all {{ count }} plants in your main garden?",
                { count: this.props.plants.length })) &&
              this.props.dispatch(deletePoints("plants",
                { pointer_type: "Plant" }))}>
            {t("delete all active plants")}
          </button>
          <SavedGardenList {...this.props} searchTerm={this.state.searchTerm} />
        </PanelSection>
        <PanelSection isOpen={this.state.plants} panel={Panel.Plants}
          toggleOpen={this.toggleOpen("plants")}
          itemCount={this.props.plants.length}
          addNew={() => push(cropSearchUrl())}
          addTitle={t("add plant")}
          addClassName={"plus-plant"}
          title={t("Plants")}>
          <EmptyStateWrapper
            notEmpty={this.props.plants.length > 0 && !noSearchResults}
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
                dispatch={this.props.dispatch} />)}
          </EmptyStateWrapper>
        </PanelSection>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Plants = connect(mapStateToProps)(RawPlants);

export interface PanelSectionProps {
  panel: Panel;
  isOpen: boolean;
  toggleOpen(): void;
  itemCount: number;
  title: string;
  addNew(): void;
  addTitle: string;
  addClassName: string;
  children: JSX.Element | JSX.Element[];
}

export const PanelSection = (props: PanelSectionProps) =>
  <div className={`panel-section ${props.isOpen ? "open" : ""}`}>
    <div className={"section-header"}
      onClick={props.toggleOpen}>
      <label>{`${props.title} (${props.itemCount})`}</label>
      <i className={`fa fa-caret-${props.isOpen ? "up" : "down"}`} />
      <div onClick={props.addNew}
        className={[
          "fb-button",
          `panel-${TAB_COLOR[props.panel]}`,
          props.addClassName,
        ].join(" ")}>
        <i className={"fa fa-plus"} title={props.addTitle} />
      </div>
    </div>
    <Collapse isOpen={props.isOpen}>
      {props.children}
    </Collapse>
  </div>;
