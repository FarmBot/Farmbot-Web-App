import React from "react";
import { connect } from "react-redux";
import { CurvesPanelState, Everything } from "../interfaces";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { selectAllCurves } from "../resources/selectors";
import { push } from "../history";
import { initSaveGetId } from "../api/crud";
import { SearchField } from "../ui/search_field";
import { Path } from "../internal_urls";
import { PanelSection } from "../plants/plant_inventory";
import { scaleData, curveSum, maxValue, maxDay } from "./data_actions";
import { CurveInventoryItemProps, CurvesProps, CurvesState } from "./interfaces";
import { TaggedCurve } from "farmbot";
import {
  CurveShape, CurveType, CURVE_TEMPLATES, DEFAULT_DAY_SCALE, DEFAULT_VALUE_SCALE,
} from "./templates";
import { Curve } from "farmbot/dist/resources/api_resources";
import { CurveIcon } from "./chart";

export const mapStateToProps = (props: Everything): CurvesProps => ({
  dispatch: props.dispatch,
  curves: selectAllCurves(props.resources.index),
  curvesPanelState: props.app.curvesPanelState,
});

export const CURVE_TYPES = () => ({
  [CurveType.water]: t("Water"),
  [CurveType.spread]: t("Spread"),
  [CurveType.height]: t("Height"),
});

export class RawCurves extends React.Component<CurvesProps, CurvesState> {
  state: CurvesState = { searchTerm: "" };

  toggleOpen = (section: keyof CurvesPanelState) => () =>
    this.props.dispatch({
      type: Actions.TOGGLE_CURVES_PANEL_OPTION, payload: section,
    });

  navigate = (id: number) => push(Path.curves(id));

  addNew = (type: Curve["type"]) => () => {
    const num = this.props.curves
      .filter(curve => curve.body.type == type)
      .length + 1;
    this.props.dispatch(initSaveGetId("Curve", {
      name: `${t(CURVE_TYPES()[type])} ${t("curve")} ${num}`,
      type,
      data: scaleData(
        CURVE_TEMPLATES[CurveShape.table],
        DEFAULT_DAY_SCALE[type],
        DEFAULT_VALUE_SCALE[type]),
      id: this.props.curves.length + 1, // remove after API implementation
    }))
      .then((id: number) => this.navigate(id))
      .catch(() => { });
  };

  item = (curve: TaggedCurve) =>
    <CurveInventoryItem
      key={curve.uuid}
      curve={curve}
      onClick={() => this.navigate(curve.body.id || 0)} />;

  render() {
    const { curves } = this.props;
    const filteredCurves = curves
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    const waterCurves = filteredCurves
      .filter(curve => curve.body.type == CurveType.water);
    const spreadCurves = filteredCurves
      .filter(curve => curve.body.type == CurveType.spread);
    const heightCurves = filteredCurves
      .filter(curve => curve.body.type == CurveType.height);
    return <DesignerPanel panelName={"curves-inventory"} panel={Panel.Curves}>
      <DesignerNavTabs />
      <DesignerPanelTop panel={Panel.Curves}>
        <SearchField searchTerm={this.state.searchTerm}
          placeholder={t("Search your curves...")}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"curves-inventory"}>
        <PanelSection isOpen={this.props.curvesPanelState.water}
          panel={Panel.Curves}
          toggleOpen={this.toggleOpen(CurveType.water)}
          itemCount={waterCurves.length}
          addNew={this.addNew(CurveType.water)}
          addTitle={t("add new water curve")}
          addClassName={"plus-curve"}
          title={t("Water curves")}>
          <div className={"water-curves"}>
            {waterCurves.map(this.item)}
          </div>
        </PanelSection>
        <PanelSection isOpen={this.props.curvesPanelState.spread}
          panel={Panel.Curves}
          toggleOpen={this.toggleOpen(CurveType.spread)}
          itemCount={spreadCurves.length}
          addNew={this.addNew(CurveType.spread)}
          addTitle={t("add new spread curve")}
          addClassName={"plus-curve"}
          title={t("spread curves")}>
          <div className={"spread-curves"}>
            {spreadCurves.map(this.item)}
          </div>
        </PanelSection>
        <PanelSection isOpen={this.props.curvesPanelState.height}
          panel={Panel.Curves}
          toggleOpen={this.toggleOpen(CurveType.height)}
          itemCount={heightCurves.length}
          addNew={this.addNew(CurveType.height)}
          addTitle={t("add new height curve")}
          addClassName={"plus-curve"}
          title={t("height curves")}>
          <div className={"height-curves"}>
            {heightCurves.map(this.item)}
          </div>
        </PanelSection>
        <EmptyStateWrapper
          notEmpty={curves.length > 0}
          graphic={EmptyStateGraphic.curves}
          title={t("No curves yet.")}
          text={Content.NO_CURVES}
          colorScheme={"curves"} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Curves = connect(mapStateToProps)(RawCurves);

const CurveInventoryItem = (props: CurveInventoryItemProps) => {
  return <div
    onClick={props.onClick}
    className={"curve-search-item"}>
    <CurveIcon curve={props.curve} />
    <span className={"curve-search-item-name"}>
      {props.curve.body.name}
    </span>
    <i className={"curve-search-item-info"}>
      {curveInfo(props.curve)}
    </i>
  </div>;
};

export const curveInfo = (curve: TaggedCurve) =>
  t("{{info}} over {{ days }} days", {
    info: curve.body.type == CurveType.water
      ? `${curveSum(curve.body.data)}L`
      : `${maxValue(curve.body.data)}mm`,
    days: maxDay(curve.body.data),
  });
