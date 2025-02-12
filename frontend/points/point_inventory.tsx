import React from "react";
import { connect } from "react-redux";
import { PointInventoryItem } from "./point_inventory_item";
import { Everything, PointsPanelState } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import {
  selectAllActivePoints, selectAllGenericPointers, selectAllPointGroups,
} from "../resources/selectors";
import { TaggedGenericPointer, TaggedPoint, TaggedPointGroup } from "farmbot";
import { t } from "../i18next_wrapper";
import { SearchField } from "../ui/search_field";
import {
  SortOptions, PointSortMenu, orderedPoints,
} from "../farm_designer/sort_options";
import { compact, isUndefined, mean, round, sortBy, uniq } from "lodash";
import { Collapse } from "@blueprintjs/core";
import { UUID } from "../resources/interfaces";
import { deletePoints } from "../api/delete_points";
import {
  EditSoilHeight,
  getSoilHeightColor, soilHeightColorQuery, soilHeightPoint, soilHeightQuery,
} from "./soil_height";
import { SourceFbosConfig } from "../devices/interfaces";
import { validFbosConfig } from "../util";
import { getFbosConfig } from "../resources/getters";
import { sourceFbosConfigValue } from "../settings/source_config_value";
import { Saucer, ToggleButton } from "../ui";
import { PanelSection } from "../plants/plant_inventory";
import { DEFAULT_CRITERIA } from "../point_groups/criteria/interfaces";
import { GroupInventoryItem } from "../point_groups/group_inventory_item";
import { createGroup } from "../point_groups/actions";
import { pointGroupSubset } from "../plants/select_plants";
import { Path } from "../internal_urls";
import { deleteAllIds } from "../api/delete_points_handler";
import { NavigationContext } from "../routes_helpers";

interface PointsSectionProps {
  title: string;
  color?: string;
  isOpen: boolean;
  toggleOpen(): void;
  toggleValue?: boolean;
  toggleAction?(): void;
  genericPoints: TaggedGenericPointer[];
  hoveredPoint: UUID | undefined;
  dispatch: Function;
  metaQuery: Record<string, string>;
  getColorOverride?(z: number): string;
  averageZ?: number;
  sourceFbosConfig?: SourceFbosConfig;
}

const PointsSection = (props: PointsSectionProps) => {
  const { genericPoints, isOpen, dispatch, averageZ, toggleAction } = props;
  return <div className={`points-section ${isOpen ? "open" : ""}`}>
    <div className={"points-section-header row grid-exp-1"}
      onClick={props.toggleOpen}>
      {props.color && <Saucer color={props.color} />}
      <label>{`${props.title} (${genericPoints.length})`}</label>
      {isOpen && toggleAction && <ToggleButton
        toggleValue={props.toggleValue}
        customText={{ textFalse: t("off"), textTrue: t("on") }}
        toggleAction={e => { e.stopPropagation(); toggleAction(); }} />}
      {isOpen && <button className={"fb-button red delete"}
        title={t("delete all")}
        onClick={e => {
          e.stopPropagation();
          confirm(t("Delete all {{ count }} points in section?",
            { count: genericPoints.length })) &&
            dispatch(deletePoints("points", { meta: props.metaQuery }));
        }}>
        {t("delete all")}
      </button>}
      <i className={`fa fa-caret-${isOpen ? "up" : "down"}`} />
    </div>
    <Collapse isOpen={isOpen}>
      {!isUndefined(averageZ) &&
        <EditSoilHeight
          sourceFbosConfig={props.sourceFbosConfig}
          averageZ={averageZ}
          dispatch={dispatch} />}
      {genericPoints.map(p => <PointInventoryItem
        key={p.uuid}
        tpp={p}
        colorOverride={props.getColorOverride?.(p.body.z)}
        hovered={props.hoveredPoint === p.uuid}
        dispatch={dispatch} />)}
    </Collapse>
  </div>;
};

export interface PointsProps {
  genericPoints: TaggedGenericPointer[];
  dispatch: Function;
  hoveredPoint: string | undefined;
  gridIds: string[];
  soilHeightLabels: boolean;
  sourceFbosConfig: SourceFbosConfig;
  groups: TaggedPointGroup[];
  allPoints: TaggedPoint[];
  pointsPanelState: PointsPanelState;
}

interface PointsState extends SortOptions {
  searchTerm: string;
  gridIds: string[];
  soilHeightColors: string[];
}

export function mapStateToProps(props: Everything): PointsProps {
  const { hoveredPoint, gridIds, soilHeightLabels,
  } = props.resources.consumers.farm_designer;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const { hardware } = props.bot;
  return {
    genericPoints: selectAllGenericPointers(props.resources.index)
      .filter(x => x),
    dispatch: props.dispatch,
    hoveredPoint,
    gridIds,
    soilHeightLabels,
    sourceFbosConfig: sourceFbosConfigValue(fbosConfig, hardware.configuration),
    groups: selectAllPointGroups(props.resources.index),
    allPoints: selectAllActivePoints(props.resources.index),
    pointsPanelState: props.app.pointsPanelState,
  };
}

export class RawPoints extends React.Component<PointsProps, PointsState> {
  state: PointsState = {
    searchTerm: "", gridIds: [], soilHeightColors: [],
  };

  toggleGrid = (gridId: string) => () =>
    this.setState({
      gridIds: this.state.gridIds.includes(gridId)
        ? this.state.gridIds.filter(id => id != gridId)
        : this.state.gridIds.concat(gridId)
    });

  toggleSoilHeightPointColor = (color: string) => () =>
    this.setState({
      soilHeightColors: this.state.soilHeightColors.includes(color)
        ? this.state.soilHeightColors.filter(c => c != color)
        : this.state.soilHeightColors.concat(color)
    });

  toggleOpen = (section: keyof PointsPanelState) => () =>
    this.props.dispatch({
      type: Actions.TOGGLE_POINTS_PANEL_OPTION, payload: section,
    });

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  navigateById = (id: number | undefined) => () => {
    this.navigate(Path.groups(id));
  };

  render() {
    const { dispatch } = this.props;
    const gridIds = compact(uniq(this.props.genericPoints
      .map(p => p.body.meta.gridId)));
    const points = orderedPoints(this.props.genericPoints, this.state)
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    const soilHeightPoints = points.filter(soilHeightPoint);
    const sortedSoilHeightPoints = this.state.sortBy
      ? soilHeightPoints
      : sortBy(soilHeightPoints, "body.z").reverse();
    const soilHeightPointColors = compact(uniq(sortedSoilHeightPoints.map(p =>
      p.body.meta.color)));
    const pointGroups = pointGroupSubset(this.props.groups, "GenericPointer");
    const filteredGroups = pointGroups
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    const standardPoints = points
      .filter(p => !soilHeightPoint(p))
      .filter(p => !p.body.meta.gridId);
    return <DesignerPanel panelName={"point-inventory"} panel={Panel.Points}>
      <DesignerPanelTop panel={Panel.Points}>
        <SearchField nameKey={"points"}
          searchTerm={this.state.searchTerm}
          placeholder={t("Search your points...")}
          customLeftIcon={<PointSortMenu
            sortOptions={this.state} onChange={u => this.setState(u)} />}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"points"}>
        <PanelSection isOpen={this.props.pointsPanelState.groups}
          panel={Panel.Points}
          toggleOpen={this.toggleOpen("groups")}
          itemCount={filteredGroups.length}
          addNew={() => dispatch(createGroup({
            criteria: {
              ...DEFAULT_CRITERIA,
              string_eq: { pointer_type: ["GenericPointer"] },
            },
            navigate: this.navigate,
          }))}
          addTitle={t("add new group")}
          addClassName={"plus-group"}
          title={t("Point Groups")}>
          {filteredGroups
            .map(group => <GroupInventoryItem
              key={group.uuid}
              group={group}
              allPoints={this.props.allPoints}
              hovered={false}
              dispatch={dispatch}
              onClick={this.navigateById(group.body.id)}
            />)}
        </PanelSection>
        <PanelSection isOpen={this.props.pointsPanelState.points}
          panel={Panel.Points}
          toggleOpen={this.toggleOpen("points")}
          itemCount={standardPoints.length}
          addNew={() => { this.navigate(Path.points("add")); }}
          addTitle={t("add point")}
          addClassName={"plus-point"}
          extraHeaderContent={this.props.pointsPanelState.points &&
            standardPoints.length > 0 &&
            <button className={"fb-button red delete"}
              title={t("delete all")}
              onClick={deleteAllIds("points", standardPoints)}>
              {t("delete all")}
            </button>}
          title={t("Points")}>
          <EmptyStateWrapper
            notEmpty={this.props.genericPoints.length > 0}
            graphic={EmptyStateGraphic.points}
            title={t("No points yet.")}
            text={Content.NO_POINTS}
            colorScheme={"points"}>
            {standardPoints.map(p =>
              <PointInventoryItem
                key={p.uuid}
                tpp={p}
                hovered={this.props.hoveredPoint === p.uuid}
                dispatch={dispatch} />)}
          </EmptyStateWrapper>
        </PanelSection>
        {sortedSoilHeightPoints.length > 0 &&
          <PointsSection
            title={soilHeightPointColors.length > 1
              ? t("All Soil Height")
              : t("Soil Height")}
            isOpen={this.props.pointsPanelState.soilHeight}
            toggleOpen={this.toggleOpen("soilHeight")}
            toggleValue={this.props.soilHeightLabels}
            toggleAction={() => dispatch({
              type: Actions.TOGGLE_SOIL_HEIGHT_LABELS, payload: undefined
            })}
            genericPoints={sortedSoilHeightPoints}
            metaQuery={soilHeightQuery}
            getColorOverride={getSoilHeightColor(sortedSoilHeightPoints)}
            averageZ={round(mean(sortedSoilHeightPoints.map(p => p.body.z)))}
            sourceFbosConfig={this.props.sourceFbosConfig}
            hoveredPoint={this.props.hoveredPoint}
            dispatch={dispatch} />}
        {soilHeightPointColors.length > 1 &&
          soilHeightPointColors.map(color =>
            <PointsSection key={color}
              title={t("Soil Height")}
              color={color}
              isOpen={this.state.soilHeightColors.includes(color)}
              toggleOpen={this.toggleSoilHeightPointColor(color)}
              genericPoints={sortedSoilHeightPoints
                .filter(p => p.body.meta.color == color)}
              metaQuery={soilHeightColorQuery(color)}
              getColorOverride={getSoilHeightColor(sortedSoilHeightPoints)}
              averageZ={round(mean(sortedSoilHeightPoints
                .filter(p => p.body.meta.color == color).map(p => p.body.z)))}
              hoveredPoint={this.props.hoveredPoint}
              dispatch={dispatch} />)}
        {gridIds.map(gridId => {
          const gridPoints = points.filter(p => p.body.meta.gridId == gridId);
          if (gridPoints.length == 0) { return <div key={gridId} />; }
          const pointName = gridPoints[0].body.name;
          return <PointsSection
            key={gridId}
            title={t("{{ name }} Grid", { name: pointName })}
            isOpen={this.state.gridIds.includes(gridId)}
            toggleOpen={this.toggleGrid(gridId)}
            toggleValue={!this.props.gridIds.includes(gridId)}
            toggleAction={() => dispatch({
              type: Actions.TOGGLE_GRID_ID, payload: gridId
            })}
            genericPoints={gridPoints}
            metaQuery={{ gridId }}
            hoveredPoint={this.props.hoveredPoint}
            dispatch={dispatch} />;
        })}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Points = connect(mapStateToProps)(RawPoints);
// eslint-disable-next-line import/no-default-export
export default Points;
