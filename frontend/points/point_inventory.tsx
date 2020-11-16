import React from "react";
import { connect } from "react-redux";
import { PointInventoryItem } from "./point_inventory_item";
import { Everything } from "../interfaces";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { selectAllGenericPointers } from "../resources/selectors";
import { TaggedGenericPointer } from "farmbot";
import { t } from "../i18next_wrapper";
import { SearchField } from "../ui/search_field";
import {
  SortOptions, PointSortMenu, orderedPoints,
} from "../farm_designer/sort_options";
import { compact, isUndefined, mean, round, sortBy, uniq } from "lodash";
import { Collapse } from "@blueprintjs/core";
import { ToggleButton } from "../controls/toggle_button";
import { UUID } from "../resources/interfaces";
import { deletePoints } from "../api/delete_points";
import {
  EditSoilHeight,
  getSoilHeightColor, soilHeightPoint, soilHeightQuery,
} from "./soil_height";
import { SourceFbosConfig } from "../devices/interfaces";
import { validFbosConfig } from "../util";
import { getFbosConfig } from "../resources/getters";
import { sourceFbosConfigValue } from "../settings/source_config_value";

interface PointsSectionProps {
  title: string;
  isOpen: boolean;
  toggleOpen(): void;
  toggleValue: boolean;
  toggleAction(): void;
  genericPoints: TaggedGenericPointer[];
  hoveredPoint: UUID | undefined;
  dispatch: Function;
  metaQuery: Record<string, string>;
  getColorOverride?(z: number): string;
  averageZ?: number;
  sourceFbosConfig?: SourceFbosConfig;
}

const PointsSection = (props: PointsSectionProps) => {
  const { genericPoints, isOpen, dispatch, averageZ } = props;
  return <div className={"points-section"}>
    <div className={"points-section-header"} onClick={props.toggleOpen}>
      <label>{`${props.title} (${genericPoints.length})`}</label>
      <i className={`fa fa-caret-${isOpen ? "up" : "down"}`} />
      <ToggleButton
        toggleValue={props.toggleValue}
        customText={{ textFalse: t("off"), textTrue: t("on") }}
        toggleAction={e => { e.stopPropagation(); props.toggleAction(); }} />
    </div>
    <Collapse isOpen={isOpen}>
      <button className={"fb-button red delete"}
        title={t("delete all")}
        onClick={() => confirm(t("Delete all {{ count }} points in section?",
          { count: genericPoints.length })) &&
          dispatch(deletePoints("points", { meta: props.metaQuery }))}>
        {t("delete all")}
      </button>
      {!isUndefined(averageZ) && props.sourceFbosConfig &&
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
}

interface PointsState extends SortOptions {
  searchTerm: string;
  gridIds: string[];
  soilHeight: boolean;
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
  };
}

export class RawPoints extends React.Component<PointsProps, PointsState> {
  state: PointsState = { searchTerm: "", gridIds: [], soilHeight: false };

  toggleGrid = (gridId: string) => () =>
    this.setState({
      gridIds: this.state.gridIds.includes(gridId)
        ? this.state.gridIds.filter(id => id != gridId)
        : this.state.gridIds.concat(gridId)
    });

  render() {
    const { soilHeight } = this.state;
    const gridIds = compact(uniq(this.props.genericPoints
      .map(p => p.body.meta.gridId)));
    const points = orderedPoints(this.props.genericPoints, this.state)
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    const soilHeightPoints = points.filter(soilHeightPoint);
    const sortedSoilHeightPoints = this.state.sortBy
      ? soilHeightPoints
      : sortBy(soilHeightPoints, "body.z").reverse();
    return <DesignerPanel panelName={"point-inventory"} panel={Panel.Points}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Points}
        linkTo={"/app/designer/points/add"}
        title={t("Add point")}>
        <SearchField searchTerm={this.state.searchTerm}
          placeholder={t("Search your points...")}
          customLeftIcon={<PointSortMenu
            sortOptions={this.state} onChange={u => this.setState(u)} />}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"points"}>
        <EmptyStateWrapper
          notEmpty={this.props.genericPoints.length > 0}
          graphic={EmptyStateGraphic.points}
          title={t("No points yet.")}
          text={Content.NO_POINTS}
          colorScheme={"points"}>
          {points
            .filter(p => !soilHeightPoint(p))
            .filter(p => !p.body.meta.gridId).map(p =>
              <PointInventoryItem
                key={p.uuid}
                tpp={p}
                hovered={this.props.hoveredPoint === p.uuid}
                dispatch={this.props.dispatch} />)}
          {sortedSoilHeightPoints.length > 0 &&
            <PointsSection
              title={t("Soil Height")}
              isOpen={soilHeight}
              toggleOpen={() => this.setState({ soilHeight: !soilHeight })}
              toggleValue={this.props.soilHeightLabels}
              toggleAction={() => this.props.dispatch({
                type: Actions.TOGGLE_SOIL_HEIGHT_LABELS, payload: undefined
              })}
              genericPoints={sortedSoilHeightPoints}
              metaQuery={soilHeightQuery}
              getColorOverride={getSoilHeightColor(sortedSoilHeightPoints)}
              averageZ={round(mean(sortedSoilHeightPoints.map(p => p.body.z)))}
              sourceFbosConfig={this.props.sourceFbosConfig}
              hoveredPoint={this.props.hoveredPoint}
              dispatch={this.props.dispatch} />}
          {gridIds.map(gridId => {
            const gridPoints = points.filter(p => p.body.meta.gridId == gridId);
            const pointName = gridPoints[0].body.name;
            return <PointsSection
              key={gridId}
              title={t("{{ name }} Grid", { name: pointName })}
              isOpen={this.state.gridIds.includes(gridId)}
              toggleOpen={this.toggleGrid(gridId)}
              toggleValue={!this.props.gridIds.includes(gridId)}
              toggleAction={() => this.props.dispatch({
                type: Actions.TOGGLE_GRID_ID, payload: gridId
              })}
              genericPoints={gridPoints}
              metaQuery={{ gridId }}
              hoveredPoint={this.props.hoveredPoint}
              dispatch={this.props.dispatch} />;
          })}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Points = connect(mapStateToProps)(RawPoints);
