import React from "react";
import { t } from "../../i18next_wrapper";
import {
  DaySelection, EqCriteriaSelection, SubCriteriaSection,
  NumberCriteriaSelection, LocationSelection, togglePointTypeCriteria,
} from ".";
import {
  GroupCriteriaProps, GroupPointCountBreakdownProps, GroupCriteriaState,
  DEFAULT_CRITERIA, ClearCriteriaProps, ClearPointIdsProps, POINTER_TYPES,
  PointerType,
  PointTypeSelectionProps,
} from "./interfaces";
import { selectPoint } from "../../farm_designer/map/actions";
import { FBSelect, Checkbox, Help, ToggleButton, Popover } from "../../ui";
import {
  POINTER_TYPE_LIST, POINTER_TYPE_DDI_LOOKUP, isPointType, validPointTypes,
  setSelectionPointType,
} from "../../plants/select_plants";
import { ToolTips } from "../../constants";
import { overwriteGroup } from "../actions";
import { PointGroupItem } from "../point_group_item";
import { TaggedPoint } from "farmbot";
import { sortGroup } from "../../farm_designer/map/group_order_visual";
import { equals } from "../../util";
import { floor, take } from "lodash";

const CRITERIA_POINT_TYPE_LOOKUP =
  (): Record<PointerType, string> => ({
    Plant: t("Plants"),
    GenericPointer: t("Points"),
    Weed: t("Weeds"),
    ToolSlot: t("Slots"),
  });

export class GroupCriteria extends
  React.Component<GroupCriteriaProps, GroupCriteriaState> {
  state: GroupCriteriaState = {
    advanced: false, clearCount: 0, dayChanged: false
  };

  componentDidMount() {
    const { pointer_type } = this.props.group.body.criteria.string_eq;
    this.props.dispatch(setSelectionPointType(validPointTypes(pointer_type)));
  }

  AdvancedToggleMenu = () =>
    <div className="criteria-options-menu">
      <label>{t("advanced mode")}</label>
      <ToggleButton
        title={t("toggle advanced view")}
        toggleValue={this.state.advanced}
        customText={{ textTrue: t("on"), textFalse: t("off") }}
        toggleAction={() =>
          this.setState({ advanced: !this.state.advanced })} />
    </div>;

  changeDay = (state: boolean) => this.setState({ dayChanged: state });

  render() {
    const { group, dispatch, slugs } = this.props;
    const { criteria } = group.body;
    const commonProps = { group, criteria, dispatch };
    const dayProps = {
      dayChanged: this.state.dayChanged,
      changeDay: this.changeDay,
      advanced: this.state.advanced,
    };
    const pointTypes = validPointTypes(criteria.string_eq.pointer_type) || [];
    return <div className="group-criteria">
      <label className="criteria-heading">{t("filters")}</label>
      <Popover
        target={<i className={"fa fa-gear dark fb-icon-button"} />}
        content={<this.AdvancedToggleMenu />} />
      {!this.state.advanced
        ? <div className={"basic"}>
          {pointTypes.length < 1 &&
            <PointTypeSelection {...commonProps} pointTypes={pointTypes} />}
          <div className={"point-type-checkboxes"}>
            <SubCriteriaSection pointerTypes={pointTypes}
              disabled={false} group={group} dispatch={dispatch} slugs={slugs} />
          </div>
          {!pointTypes.includes("ToolSlot") &&
            <DaySelection {...commonProps} {...dayProps} />}
          <LocationSelection {...commonProps} botSize={this.props.botSize}
            editGroupAreaInMap={this.props.editGroupAreaInMap} />
        </div>
        : <div className={"advanced"}>
          <DaySelection {...commonProps} {...dayProps} />
          <label>{t("strings")}</label>
          <Help text={t(ToolTips.DOT_NOTATION_TIP)} />
          <EqCriteriaSelection<string> {...commonProps}
            type={"string"} eqCriteria={criteria.string_eq}
            criteriaKey={"string_eq"} />
          <label>{t("numbers")}</label>
          <EqCriteriaSelection<number> {...commonProps}
            type={"number"} eqCriteria={criteria.number_eq}
            criteriaKey={"number_eq"} />
          <NumberCriteriaSelection {...commonProps} criteriaKey={"number_lt"} />
          <NumberCriteriaSelection {...commonProps} criteriaKey={"number_gt"} />
        </div>}
    </div>;
  }
}

/** Reset all group criteria to defaults. */
const ClearCriteria = (props: ClearCriteriaProps) =>
  <button className="clear-criteria fb-button red"
    title={t("clear all filters")}
    onClick={() => {
      if (confirm(t("Clear all group filters?"))) {
        props.dispatch(overwriteGroup(props.group, {
          ...props.group.body, criteria: DEFAULT_CRITERIA
        }));
      }
    }}>
    {t("clear")}
  </button>;

/** Clear manually selected points. */
const ClearPointIds = (props: ClearPointIdsProps) =>
  <button className="clear-point-ids fb-button red"
    title={t("clear manual selections")}
    onClick={() => {
      if (confirm(t("Remove all manual selections?"))) {
        props.dispatch(overwriteGroup(props.group, {
          ...props.group.body, point_ids: []
        }));
        props.dispatch(selectPoint(undefined));
      }
    }}>
    {t("clear")}
  </button>;

interface GroupPointCountBreakdownState {
  maxCount: number;
}

/** Show counts of manual and criteria selections. */
export class GroupPointCountBreakdown
  extends React.Component<GroupPointCountBreakdownProps,
    GroupPointCountBreakdownState> {

  state: GroupPointCountBreakdownState = {
    maxCount: calcMaxCount(),
  };

  shouldComponentUpdate = (
    nextProps: GroupPointCountBreakdownProps,
    nextState: GroupPointCountBreakdownState,
  ) => {
    if (this.props.pointsSelectedByGroup.length < 50) { return true; }
    return !equals(this.props, nextProps) || !equals(this.state, nextState);
  };

  componentDidMount = () => this.setState({ maxCount: calcMaxCount() });

  toggleExpand = () => this.setState({
    maxCount: this.state.maxCount > 100 ? calcMaxCount() : 1000,
  });

  get sortedGroup() {
    return sortGroup(
      this.props.tryGroupSortType || this.props.group.body.sort_type,
      this.props.pointsSelectedByGroup);
  }

  render() {
    const { maxCount } = this.state;
    const { group, hovered, dispatch, iconDisplay } = this.props;
    const manuallyAddedIds = group.body.point_ids;
    const sortedPoints = this.sortedGroup;
    const manualPoints = sortedPoints
      .filter(p => manuallyAddedIds.includes(p.body.id || 0));
    const criteriaPoints = sortedPoints
      .filter(p => !manuallyAddedIds.includes(p.body.id || 0));
    const generatePointIcons = (point: TaggedPoint) =>
      <PointGroupItem
        key={point.uuid}
        hovered={point.uuid === hovered}
        group={group}
        point={point}
        tools={this.props.tools}
        toolTransformProps={this.props.toolTransformProps}
        dispatch={dispatch} />;
    return <div className={"group-member-count-breakdown"}>
      <div className={"manual-group-member-count"}>
        <p>{`${manualPoints.length} ${t("manually selected")}`}</p>
        <ClearPointIds dispatch={dispatch} group={group} />
      </div>
      {iconDisplay && manualPoints.length > 0 &&
        <div className={"point-list-wrapper"}>
          {take(manualPoints, maxCount).map(generatePointIcons)}
          <MoreIndicatorIcon count={manualPoints.length}
            maxCount={maxCount} onClick={this.toggleExpand} />
        </div>}
      <div className={"group-member-section"}>
        <div className={"criteria-group-member-count"}>
          <p>{`${criteriaPoints.length} ${t("selected by filters")}`}</p>
          <ClearCriteria dispatch={dispatch} group={group} />
        </div>
        {iconDisplay && criteriaPoints.length > 0 &&
          <div className={"point-list-wrapper"}>
            {take(criteriaPoints, maxCount).map(generatePointIcons)}
            <MoreIndicatorIcon count={criteriaPoints.length}
              maxCount={maxCount} onClick={this.toggleExpand} />
          </div>}
      </div>
    </div>;
  }
}

export const calcMaxCount = (rows = 2) => {
  const wrapperElement = document.querySelector(".point-list-wrapper");
  const elementWidth = wrapperElement?.clientWidth || 430;
  return floor(elementWidth / 20) * rows - 1;
};

export interface MoreIndicatorIconProps {
  count: number;
  maxCount: number;
  onClick(): void;
}

export const MoreIndicatorIcon = (props: MoreIndicatorIconProps) =>
  props.count > props.maxCount
    ? <span className={"group-item-icon more-indicator"} onClick={props.onClick}>
      <p>+{props.count - props.maxCount}</p>
    </span>
    : <></>;

/** Select pointer_type string equal criteria,
 *  which determines if any additional criteria is shown. */
export const PointTypeSelection = (props: PointTypeSelectionProps) =>
  <div className={"point-type-selection"}>
    <p className={"category"}>{t("Select all")}</p>
    <FBSelect
      key={JSON.stringify(props.group.body)}
      list={POINTER_TYPE_LIST().slice(0, -1)}
      customNullLabel={t("Select one")}
      selectedItem={props.pointTypes[0]
        ? POINTER_TYPE_DDI_LOOKUP()[props.pointTypes[0]]
        : undefined}
      onChange={ddi => {
        if (isPointType(ddi.value)) {
          props.dispatch(togglePointTypeCriteria(props.group, ddi.value, true));
          props.dispatch(setSelectionPointType([ddi.value]));
        }
      }} />
    {props.pointTypes.length > 1 &&
      POINTER_TYPES.map(pointerType =>
        <div className="point-type-section" key={pointerType}>
          <Checkbox
            onChange={() =>
              props.dispatch(togglePointTypeCriteria(props.group, pointerType))}
            checked={props.pointTypes.includes(pointerType)}
            title={CRITERIA_POINT_TYPE_LOOKUP()[pointerType]} />
          <p>{CRITERIA_POINT_TYPE_LOOKUP()[pointerType]}</p>
        </div>)}
  </div>;
