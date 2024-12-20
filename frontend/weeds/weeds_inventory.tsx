import React from "react";
import { connect } from "react-redux";
import { Everything, WeedsPanelState } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { TaggedPoint, TaggedPointGroup, TaggedWeedPointer } from "farmbot";
import {
  selectAllActivePoints, selectAllPointGroups, selectAllWeedPointers,
} from "../resources/selectors";
import { WeedInventoryItem } from "./weed_inventory_item";
import { SearchField } from "../ui/search_field";
import {
  SortOptions, PointSortMenu, orderedPoints,
} from "../farm_designer/sort_options";
import { ToggleButton } from "../ui";
import {
  setWebAppConfigValue, GetWebAppConfigValue, getWebAppConfigValue,
} from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { UUID } from "../resources/interfaces";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { edit, save } from "../api/crud";
import { Collapse } from "@blueprintjs/core";
import { PanelSection } from "../plants/plant_inventory";
import { pointGroupSubset } from "../plants/select_plants";
import { DEFAULT_CRITERIA } from "../point_groups/criteria/interfaces";
import { createGroup } from "../point_groups/actions";
import { GroupInventoryItem } from "../point_groups/group_inventory_item";
import { Path } from "../internal_urls";
import { deleteAllIds } from "../api/delete_points_handler";
import { NavigationContext } from "../routes_helpers";

export interface WeedsProps {
  weeds: TaggedWeedPointer[];
  dispatch: Function;
  hoveredPoint: string | undefined;
  getConfigValue: GetWebAppConfigValue;
  groups: TaggedPointGroup[];
  allPoints: TaggedPoint[];
  weedsPanelState: WeedsPanelState;
}

interface WeedsState extends SortOptions {
  searchTerm: string;
}

export const mapStateToProps = (props: Everything): WeedsProps => ({
  weeds: selectAllWeedPointers(props.resources.index),
  dispatch: props.dispatch,
  hoveredPoint: props.resources.consumers.farm_designer.hoveredPoint,
  getConfigValue: getWebAppConfigValue(() => props),
  groups: selectAllPointGroups(props.resources.index),
  allPoints: selectAllActivePoints(props.resources.index),
  weedsPanelState: props.app.weedsPanelState,
});

export interface WeedsSectionProps {
  category: "pending" | "active" | "removed";
  sectionTitle: string;
  emptyStateText: string;
  open: boolean;
  hoveredPoint: UUID | undefined;
  clickOpen(): void;
  items: TaggedWeedPointer[];
  dispatch: Function;
  layerValue?: boolean;
  layerSetting?: BooleanConfigKey;
  layerDisabled?: boolean;
  children?: React.ReactNode;
  allWeeds?: TaggedWeedPointer[];
}

export const WeedsSection = (props: WeedsSectionProps) => {
  const { layerSetting } = props;
  const rawMaxSize = Math.max(...props.items.map(item => item.body.radius));
  const maxSize = isFinite(rawMaxSize) ? rawMaxSize : 0;
  const noWeeds = props.allWeeds?.length == 0;
  return <div className={`${props.category}-weeds`}>
    <div className={`${props.category}-weeds-header section-header`}
      onClick={props.clickOpen}>
      <label>{`${t(props.sectionTitle)} (${props.items.length})`}</label>
      <div className="row">
        {props.category == "pending" && props.items.length > 0 && props.open &&
          <div className={"approval-buttons row"}>
            <button className={"fb-button green"} onClick={e => {
              e.stopPropagation();
              props.items.map(weed => {
                props.dispatch(edit(weed, { plant_stage: "active" }));
                props.dispatch(save(weed.uuid));
              });
            }}>
              <i className={"fa fa-check"} />{t("all")}
            </button>
            <button className={"fb-button red"}
              onClick={deleteAllIds("weeds", props.items)}>
              <i className={"fa fa-times"} />{t("all")}
            </button>
          </div>}
        {layerSetting && props.open &&
          <ToggleButton disabled={props.layerDisabled}
            toggleValue={props.layerValue}
            customText={{ textFalse: t("off"), textTrue: t("on") }}
            toggleAction={e => {
              e.stopPropagation();
              props.dispatch(setWebAppConfigValue(
                layerSetting, !props.layerValue));
            }} />}
        {props.open && props.children}
        <i className={`fa fa-caret-${props.open ? "up" : "down"}`} />
      </div>
    </div>
    <Collapse isOpen={props.open}>
      {noWeeds && <EmptyStateWrapper
        notEmpty={false}
        graphic={EmptyStateGraphic.weeds}
        title={t("No weeds yet.")}
        text={Content.NO_WEEDS}
        colorScheme={"weeds"}>
      </EmptyStateWrapper>}
      {props.items.length == 0 && !noWeeds &&
        <p className={"no-weeds"}>{t(props.emptyStateText)}</p>}
      {props.items.map(p => <WeedInventoryItem
        key={p.uuid}
        tpp={p}
        maxSize={maxSize}
        pending={props.category == "pending"}
        hovered={props.hoveredPoint === p.uuid}
        dispatch={props.dispatch} />)}
    </Collapse>
  </div>;
};

export class RawWeeds extends React.Component<WeedsProps, WeedsState> {
  state: WeedsState = {
    searchTerm: "", sortBy: "radius", reverse: true,
  };

  get weeds() {
    return orderedPoints(this.props.weeds, this.state).filter(p =>
      p.body.name.toLowerCase().includes(this.state.searchTerm.toLowerCase()));
  }

  toggleOpen = (section: keyof WeedsPanelState) => () =>
    this.props.dispatch({
      type: Actions.TOGGLE_WEEDS_PANEL_OPTION, payload: section,
    });

  PendingWeeds = () => <WeedsSection
    category={"pending"}
    sectionTitle={t("Pending")}
    emptyStateText={t("No pending weeds.")}
    items={this.weeds.filter(p => p.body.plant_stage === "pending")}
    open={this.props.weedsPanelState.pending}
    hoveredPoint={this.props.hoveredPoint}
    clickOpen={this.toggleOpen("pending")}
    dispatch={this.props.dispatch} />;

  ActiveWeeds = () => {
    const items = this.weeds.filter(p =>
      !["removed", "pending"].includes(p.body.plant_stage));
    return <WeedsSection
      category={"active"}
      sectionTitle={t("Active")}
      emptyStateText={t("No active weeds.")}
      items={items}
      open={this.props.weedsPanelState.active}
      hoveredPoint={this.props.hoveredPoint}
      clickOpen={this.toggleOpen("active")}
      layerSetting={BooleanSetting.show_weeds}
      layerValue={!!this.props.getConfigValue(BooleanSetting.show_weeds)}
      allWeeds={this.props.weeds}
      dispatch={this.props.dispatch}>
      <div className={"section-action-btn-group row"}>
        {items.length > 0 &&
          <button className={"fb-button red delete"}
            title={t("delete all")}
            onClick={deleteAllIds("weeds", items)}>
            {t("delete all")}
          </button>}
        <div
          className={"fb-button green plus-weed"}
          onClick={e => {
            e.stopPropagation();
            this.navigate(Path.weeds("add"));
          }}>
          <i className={"fa fa-plus"} title={t("add weed")} />
        </div>
      </div>
    </WeedsSection>;
  };

  RemovedWeeds = () => {
    const items = this.weeds.filter(p => p.body.plant_stage === "removed");
    return <WeedsSection
      category={"removed"}
      sectionTitle={t("Removed")}
      emptyStateText={t("No removed weeds.")}
      items={items}
      open={this.props.weedsPanelState.removed}
      hoveredPoint={this.props.hoveredPoint}
      clickOpen={this.toggleOpen("removed")}
      layerSetting={BooleanSetting.show_historic_points}
      layerValue={!!this.props.getConfigValue(BooleanSetting.show_historic_points)}
      layerDisabled={!this.props.getConfigValue(BooleanSetting.show_weeds)}
      dispatch={this.props.dispatch}>
      <div className={"section-action-btn-group row"}>
        {items.length > 0 &&
          <button className={"fb-button red delete"}
            title={t("delete all")}
            onClick={deleteAllIds("weeds", items)}>
            {t("delete all")}
          </button>}
      </div>
    </WeedsSection>;
  };

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;
  navigateById = (id: number | undefined) => () => {
    this.navigate(Path.groups(id));
  };

  render() {
    const weedGroups = pointGroupSubset(this.props.groups, "Weed");
    const filteredGroups = weedGroups
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    return <DesignerPanel panelName={"weeds-inventory"} panel={Panel.Weeds}>
      <DesignerPanelTop panel={Panel.Weeds}>
        <SearchField nameKey={"weeds"}
          searchTerm={this.state.searchTerm}
          placeholder={t("Search your weeds...")}
          customLeftIcon={<PointSortMenu
            sortOptions={this.state} onChange={u => this.setState(u)} />}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"weeds-inventory"}>
        <PanelSection isOpen={this.props.weedsPanelState.groups}
          panel={Panel.Weeds}
          toggleOpen={this.toggleOpen("groups")}
          itemCount={weedGroups.length}
          addNew={() => this.props.dispatch(createGroup({
            criteria: {
              ...DEFAULT_CRITERIA,
              string_eq: { pointer_type: ["Weed"] },
            },
            navigate: this.navigate,
          }))}
          addTitle={t("add new group")}
          addClassName={"plus-group"}
          title={t("Weed Groups")}>
          {filteredGroups
            .map(group => <GroupInventoryItem
              key={group.uuid}
              group={group}
              allPoints={this.props.allPoints}
              hovered={false}
              dispatch={this.props.dispatch}
              onClick={this.navigateById(group.body.id)}
            />)}
        </PanelSection>
        <this.PendingWeeds />
        <this.ActiveWeeds />
        <this.RemovedWeeds />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Weeds = connect(mapStateToProps)(RawWeeds);
// eslint-disable-next-line import/no-default-export
export default Weeds;
