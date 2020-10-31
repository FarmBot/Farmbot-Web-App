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
import { compact, uniq } from "lodash";
import { Collapse } from "@blueprintjs/core";
import { ToggleButton } from "../controls/toggle_button";
import { UUID } from "../resources/interfaces";
import { deletePoints } from "../api/delete_points";


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
}

const PointsSection = (props: PointsSectionProps) =>
  <div className={"points-section"}>
    <div className={"points-section-header"}>
      <label>{`${props.title} (${props.genericPoints.length})`}</label>
      <i className={`fa fa-caret-${props.isOpen ? "up" : "down"}`}
        onClick={props.toggleOpen} />
      <ToggleButton
        toggleValue={props.toggleValue}
        customText={{ textFalse: t("off"), textTrue: t("on") }}
        toggleAction={props.toggleAction} />
      <button className={"fb-button red delete"}
        title={t("delete all")}
        onClick={() => confirm(t("Delete all {{ count }} points in section?",
          { count: props.genericPoints.length })) &&
          props.dispatch(deletePoints("points", { meta: props.metaQuery }))}>
        <i className={"fa fa-times"} />
      </button>
    </div>
    <Collapse isOpen={props.isOpen}>
      {props.genericPoints.map(p => <PointInventoryItem
        key={p.uuid}
        tpp={p}
        hovered={props.hoveredPoint === p.uuid}
        dispatch={props.dispatch} />)}
    </Collapse>
  </div>;


export interface PointsProps {
  genericPoints: TaggedGenericPointer[];
  dispatch: Function;
  hoveredPoint: string | undefined;
  gridIds: string[];
  soilHeightLabels: boolean;
}

interface PointsState extends SortOptions {
  searchTerm: string;
  gridIds: string[];
  soilHeight: boolean;
}

export function mapStateToProps(props: Everything): PointsProps {
  const { hoveredPoint, gridIds, soilHeightLabels,
  } = props.resources.consumers.farm_designer;
  return {
    genericPoints: selectAllGenericPointers(props.resources.index)
      .filter(x => x),
    dispatch: props.dispatch,
    hoveredPoint,
    gridIds,
    soilHeightLabels,
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
    const soilHeightPoints = points
      .filter(p => p.body.meta.created_by == "measure-soil-height");
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
          {points.filter(p => p.body.meta.created_by != "measure-soil-height")
            .filter(p => !p.body.meta.gridId).map(p =>
              <PointInventoryItem
                key={p.uuid}
                tpp={p}
                hovered={this.props.hoveredPoint === p.uuid}
                dispatch={this.props.dispatch} />)}
          {soilHeightPoints.length > 0 &&
            <PointsSection
              title={t("Soil Height")}
              isOpen={soilHeight}
              toggleOpen={() => this.setState({ soilHeight: !soilHeight })}
              toggleValue={this.props.soilHeightLabels}
              toggleAction={() => this.props.dispatch({
                type: Actions.TOGGLE_SOIL_HEIGHT_LABELS, payload: undefined
              })}
              genericPoints={soilHeightPoints}
              metaQuery={{ created_by: "measure-soil-height" }}
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
