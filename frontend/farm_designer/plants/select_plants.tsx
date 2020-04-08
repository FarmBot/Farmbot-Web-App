import * as React from "react";
import { history } from "../../history";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { PlantInventoryItem } from "./plant_inventory_item";
import { destroy } from "../../api/crud";
import { unselectPlant, selectPoint, setHoveredPlant } from "../map/actions";
import { Actions, Content } from "../../constants";
import { TaggedPlant } from "../map/interfaces";
import { getPlants } from "../state_to_props";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { createGroup } from "../point_groups/actions";
import { PanelColor } from "../panel_header";
import { error } from "../../toast/toast";
import { PlantStatusBulkUpdate } from "./edit_plant_status";
import { FBSelect, DropDownItem } from "../../ui";
import {
  PointType, TaggedPoint, TaggedGenericPointer, TaggedToolSlotPointer,
  TaggedTool,
  TaggedWeedPointer,
} from "farmbot";
import { UUID } from "../../resources/interfaces";
import {
  selectAllActivePoints, selectAllToolSlotPointers, selectAllTools,
} from "../../resources/selectors";
import { PointInventoryItem } from "../points/point_inventory_item";
import { ToolSlotInventoryItem } from "../tools";
import { getWebAppConfigValue, GetWebAppConfigValue } from "../../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { isBotOriginQuadrant, BotOriginQuadrant } from "../interfaces";
import { isActive } from "../tools/edit_tool";
import { uniq } from "lodash";
import { POINTER_TYPES } from "../point_groups/criteria/interfaces";
import { WeedInventoryItem } from "../weeds/weed_inventory_item";

export const POINTER_TYPE_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  Plant: { label: t("Plants"), value: "Plant" },
  GenericPointer: { label: t("Points"), value: "GenericPointer" },
  Weed: { label: t("Weeds"), value: "Weed" },
  ToolSlot: { label: t("Slots"), value: "ToolSlot" },
  All: { label: t("All"), value: "All" },
});
export const POINTER_TYPE_LIST = () => [
  POINTER_TYPE_DDI_LOOKUP().Plant,
  POINTER_TYPE_DDI_LOOKUP().GenericPointer,
  POINTER_TYPE_DDI_LOOKUP().Weed,
  POINTER_TYPE_DDI_LOOKUP().ToolSlot,
  POINTER_TYPE_DDI_LOOKUP().All,
];

export const mapStateToProps = (props: Everything): SelectPlantsProps => {
  const getWebAppConfig = getWebAppConfigValue(() => props);
  const xySwap = !!getWebAppConfig(BooleanSetting.xy_swap);
  const rawQuadrant = getWebAppConfig(NumericSetting.bot_origin_quadrant);
  const quadrant = isBotOriginQuadrant(rawQuadrant) ? rawQuadrant : 2;
  return {
    selected: props.resources.consumers.farm_designer.selectedPoints,
    selectionPointType: props.resources.consumers.farm_designer.selectionPointType,
    getConfigValue: getWebAppConfig,
    plants: getPlants(props.resources),
    allPoints: selectAllActivePoints(props.resources.index),
    dispatch: props.dispatch,
    gardenOpen: props.resources.consumers.farm_designer.openedSavedGarden,
    tools: selectAllTools(props.resources.index),
    isActive: isActive(selectAllToolSlotPointers(props.resources.index)),
    xySwap,
    quadrant,
  };
};

export interface SelectPlantsProps {
  plants: TaggedPlant[];
  allPoints: TaggedPoint[];
  dispatch: Function;
  selected: UUID[] | undefined;
  selectionPointType: PointType[] | undefined;
  getConfigValue: GetWebAppConfigValue;
  gardenOpen: string | undefined;
  xySwap: boolean;
  quadrant: BotOriginQuadrant;
  isActive(id: number | undefined): boolean;
  tools: TaggedTool[];
}

export class RawSelectPlants extends React.Component<SelectPlantsProps, {}> {
  componentDidMount() {
    const { dispatch, selected } = this.props;
    if (selected && selected.length == 1) {
      unselectPlant(dispatch)();
    } else {
      dispatch(setHoveredPlant(undefined));
      dispatch({ type: Actions.HOVER_PLANT_LIST_ITEM, payload: undefined });
    }
  }

  componentWillUnmount = () => this.props.dispatch({
    type: Actions.SET_SELECTION_POINT_TYPE,
    payload: undefined,
  });

  get selected() { return this.props.selected || []; }

  destroySelected = (plantUUIDs: string[] | undefined) => {
    if (plantUUIDs && plantUUIDs.length > 0 &&
      confirm(t("Are you sure you want to delete {{length}} plants?",
        { length: plantUUIDs.length }))) {
      plantUUIDs.map(uuid => {
        this.props.dispatch(destroy(uuid, true))
          .then(() => { }, () => { });
      });
      history.push("/app/designer/plants");
    }
  }

  get selectionPointType() {
    const selectionPointTypes = this.props.selectionPointType || ["Plant"];
    return selectionPointTypes.length > 1 ? "All" : selectionPointTypes[0];
  }

  ActionButtons = () =>
    <div className="panel-action-buttons">
      <FBSelect
        list={POINTER_TYPE_LIST()}
        selectedItem={POINTER_TYPE_DDI_LOOKUP()[this.selectionPointType]}
        onChange={ddi => {
          this.props.dispatch(selectPoint(undefined));
          this.props.dispatch({
            type: Actions.SET_SELECTION_POINT_TYPE,
            payload: ddi.value == "All" ? POINTER_TYPES : [ddi.value],
          });
        }} />
      <div className="button-row">
        <button className="fb-button gray"
          title={t("Select none")}
          onClick={() => this.props.dispatch(selectPoint(undefined))}>
          {t("Select none")}
        </button>
        <button className="fb-button gray"
          title={t("Select all")}
          onClick={() => this.props.dispatch(selectPoint(this.allPointUuids))}>
          {t("Select all")}
        </button>
      </div>
      <label>{t("SELECTION ACTIONS")}</label>
      <div className="button-row">
        <button className="fb-button red"
          title={t("Delete")}
          onClick={() => this.destroySelected(this.props.selected)}>
          {t("Delete")}
        </button>
        <button className="fb-button dark-blue"
          title={t("Create group")}
          onClick={() => !this.props.gardenOpen
            ? this.props.dispatch(createGroup({ pointUuids: this.selected }))
            : error(t(Content.ERROR_PLANT_TEMPLATE_GROUP))}>
          {t("Create group")}
        </button>
        {this.selectionPointType == "Plant" &&
          <PlantStatusBulkUpdate
            plants={this.props.plants}
            selected={this.selected}
            dispatch={this.props.dispatch} />}
      </div>
    </div>;

  get filteredPoints() {
    const { plants, allPoints, selectionPointType, getConfigValue } = this.props;
    return getFilteredPoints({
      plants, allPoints, selectionPointType, getConfigValue
    });
  }

  get selectedPointData() {
    const { plants, allPoints, selectionPointType } = this.props;
    return getSelectedPoints({
      plants, allPoints, selectionPointType,
      selected: this.selected,
    });
  }

  get allPointUuids() {
    return this.filteredPoints.map(p => p.uuid);
  }

  get itemName() {
    const { value } = POINTER_TYPE_DDI_LOOKUP()[this.selectionPointType];
    const ITEM_NAME_LOOKUP:
      Record<string, Record<"singular" | "plural", string>> = {
      "Plant": { singular: t("plant"), plural: t("plants") },
      "GenericPointer": { singular: t("point"), plural: t("points") },
      "Weed": { singular: t("weed"), plural: t("weeds") },
      "ToolSlot": { singular: t("slot"), plural: t("slots") },
      "All": { singular: t("item"), plural: t("items") },
    };
    return ITEM_NAME_LOOKUP["" + value][
      this.selected.length == 1 ? "singular" : "plural"];
  }

  render() {
    const { dispatch } = this.props;
    return <DesignerPanel panelName={"plant-selection"}
      panelColor={PanelColor.lightGray}>
      <DesignerPanelHeader
        panelName={"plant-selection"}
        panelColor={PanelColor.lightGray}
        blackText={true}
        title={t("{{length}} {{name}} selected",
          { length: this.selected.length, name: this.itemName })}
        backTo={"/app/designer/plants"}
        onBack={unselectPlant(dispatch)}
        description={Content.BOX_SELECT_DESCRIPTION} />
      <this.ActionButtons />

      <DesignerPanelContent panelName={"plant-selection"}>
        {this.selectedPointData.map(p => {
          if (p.kind == "PlantTemplate" || p.body.pointer_type == "Plant") {
            return <PlantInventoryItem
              key={p.uuid}
              plant={p as TaggedPlant}
              hovered={false}
              dispatch={dispatch} />;
          } else {
            switch (p.body.pointer_type) {
              case "GenericPointer":
                return <PointInventoryItem
                  key={p.uuid}
                  tpp={p as TaggedGenericPointer}
                  hovered={false}
                  dispatch={this.props.dispatch} />;
              case "Weed":
                return <WeedInventoryItem
                  key={p.uuid}
                  tpp={p as TaggedWeedPointer}
                  hovered={false}
                  dispatch={this.props.dispatch} />;
              case "ToolSlot":
                return <ToolSlotInventoryItem
                  key={p.uuid}
                  hovered={false}
                  dispatch={this.props.dispatch}
                  toolSlot={p as TaggedToolSlotPointer}
                  isActive={this.props.isActive}
                  tools={this.props.tools}
                  xySwap={this.props.xySwap}
                  quadrant={this.props.quadrant}
                  hideDropdown={true} />;
            }
          }
        })}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const SelectPlants = connect(mapStateToProps)(RawSelectPlants);

export interface GetFilteredPointsProps {
  selectionPointType: PointType[] | undefined;
  plants: TaggedPlant[];
  allPoints: TaggedPoint[];
  getConfigValue?: GetWebAppConfigValue;
}

export const getFilteredPoints = (props: GetFilteredPointsProps) => {
  const selectionPointType = (props.selectionPointType || ["Plant"])
    .filter(x => !props.getConfigValue ||
      getVisibleLayers(props.getConfigValue).includes(x));
  const filterPoints = (p: TaggedPoint) =>
    selectionPointType.includes(p.body.pointer_type);
  const plants = selectionPointType.includes("Plant") ? props.plants : [];
  const otherPoints =
    props.allPoints
      .filter(p => p.body.pointer_type != "Plant")
      .filter(filterPoints);
  const plantsAndOtherPoints: (TaggedPlant | TaggedPoint)[] = [];
  return uniq(plantsAndOtherPoints.concat(plants).concat(otherPoints));
};

interface GetSelectedPointsProps extends GetFilteredPointsProps {
  selected: UUID[];
}

export const getSelectedPoints = (props: GetSelectedPointsProps) =>
  props.selected
    .map(uuid => getFilteredPoints(props).filter(p => p.uuid == uuid)[0])
    .filter(p => p);

enum PointerType {
  Plant = "Plant",
  GenericPointer = "GenericPointer",
  Weed = "Weed",
  ToolSlot = "ToolSlot",
}

const getVisibleLayers = (getConfigValue: GetWebAppConfigValue): PointType[] => {
  const showPlants = getConfigValue(BooleanSetting.show_plants);
  const showPoints = getConfigValue(BooleanSetting.show_points);
  const showWeeds = getConfigValue(BooleanSetting.show_weeds);
  const showFarmbot = getConfigValue(BooleanSetting.show_farmbot);
  return [
    ...(showPlants ? [PointerType.Plant] : []),
    ...(showPoints ? [PointerType.GenericPointer] : []),
    ...(showWeeds ? [PointerType.Weed] : []),
    ...(showFarmbot ? [PointerType.ToolSlot] : []),
  ];
};
