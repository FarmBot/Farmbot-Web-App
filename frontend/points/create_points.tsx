import React from "react";
import { connect } from "react-redux";
import { Everything, ResourceColor } from "../interfaces";
import { Row, BlurableInput, ColorPicker } from "../ui";
import {
  DrawnPointPayl, GridPlantingRequest,
} from "../farm_designer/interfaces";
import { Actions, Content } from "../constants";
import {
  DesignerPanel,
  DesignerPanelHeader,
  DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { parseIntInput } from "../util";
import { validBotLocationData } from "../util/location";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { ListItem } from "../plants/plant_panel";
import { PlantGrid } from "../plants/grid/plant_grid";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import {
  definedPosition, UseCurrentLocation,
} from "../tools/tool_slot_edit_components";
import { BotPosition } from "../devices/interfaces";
import { clone, isUndefined } from "lodash";
import { uuid } from "farmbot";
import { Path } from "../internal_urls";
import { NavigationContext } from "../routes_helpers";
import { NavigateFunction } from "react-router";
import { Mode } from "../farm_designer/map/interfaces";
import { getMode } from "../farm_designer/map/util";
import { createPoint, CreatePointProps } from "./create_point_action";
import {
  DEFAULT_POINT_GRID_RADIUS,
  DEFAULT_POINT_GRID_SPACING,
} from "../plants/grid/grid_math";

export { createPoint };
export type { CreatePointProps };

export function mapStateToProps(props: Everything): CreatePointsProps {
  const { drawnPoint } = props.resources.consumers.farm_designer;
  const getConfigValue = getWebAppConfigValue(() => props);
  return {
    dispatch: props.dispatch,
    drawnPoint: drawnPoint,
    gridPlanting:
      props.resources.consumers.farm_designer.gridPlanting,
    legacyPointGrid:
      props.resources.consumers.farm_designer.legacyPointGrid,
    is3D: !!getConfigValue(BooleanSetting.three_d_garden),
    xySwap: !!getConfigValue(BooleanSetting.xy_swap),
    botPosition: validBotLocationData(props.bot.hardware.location_data).position,
  };
}

export const resetDrawnPointDataAction = () => {
  const payload: DrawnPointPayl = {
    name: getMode() == Mode.createWeed ? t("Created Weed") : t("Created Point"),
    cx: undefined,
    cy: undefined,
    z: 0,
    r: 0,
    color: getMode() == Mode.createWeed ? "red" : "green",
    at_soil_level: false,
  };
  return {
    type: Actions.SET_DRAWN_POINT_DATA,
    payload,
  };
};

export interface CreatePointsProps {
  dispatch: Function;
  drawnPoint: DrawnPointPayl | undefined;
  gridPlanting?: GridPlantingRequest;
  legacyPointGrid?: boolean;
  is3D?: boolean;
  xySwap: boolean;
  botPosition: BotPosition;
}

type EditablePointKey = Exclude<
  keyof DrawnPointPayl,
  "placementPhase"
>;

export class RawCreatePoints extends React.Component<CreatePointsProps> {
  constructor(props: CreatePointsProps) {
    super(props);
    this.state = {};
  }

  get panel() { return Path.getSlug(Path.designer()); }

  componentDidMount() {
    window.addEventListener("keydown", this.toggleGridWithKeyboard);
    if (isUndefined(this.props.drawnPoint)) {
      this.props.dispatch(resetDrawnPointDataAction());
    }
    this.props.legacyPointGrid && this.consumeLegacyPointGrid();
  }

  componentDidUpdate(prevProps: CreatePointsProps) {
    !prevProps.legacyPointGrid
      && this.props.legacyPointGrid
      && this.consumeLegacyPointGrid();
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.toggleGridWithKeyboard);
    this.props.dispatch({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: undefined,
    });
    this.pointGridRequest && this.props.dispatch({
      type: Actions.CLEAR_GRID_PLANTING,
      payload: this.pointGridRequest.token,
    });
  }

  consumeLegacyPointGrid = () => this.props.dispatch({
    type: Actions.SET_LEGACY_POINT_GRID,
    payload: false,
  });

  setDrawnPoint = (drawnPoint: DrawnPointPayl) => {
    this.props.dispatch({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: drawnPoint,
    });
    const request = this.pointGridRequest;
    request && this.props.dispatch({
      type: Actions.SET_GRID_PLANTING,
      payload: {
        ...request,
        itemName: drawnPoint.name,
        z: drawnPoint.z,
        meta: {
          ...request.meta,
          color: drawnPoint.color,
          at_soil_level: "" + drawnPoint.at_soil_level,
        },
      },
    });
  };

  updateAttr = (key: EditablePointKey, value: string | boolean) => {
    const { drawnPoint: rawDrawnPoint } = this.props;
    const drawnPoint = clone(rawDrawnPoint);
    if (drawnPoint) {
      switch (key) {
        case "name":
        case "color":
          drawnPoint[key] = "" + value;
          break;
        case "at_soil_level":
          drawnPoint[key] = !!value;
          break;
        default:
          const intValue = parseIntInput("" + value);
          drawnPoint[key] = intValue;
      }
      this.setDrawnPoint(drawnPoint);
    }
  };

  updateValue = (key: EditablePointKey) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      this.updateAttr(key, value);
    };
  };

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate: NavigateFunction = url => { this.context?.(url as string); };

  closePanel = () => { this.navigate(Path.designer(this.panel)); };

  get pointGridRequest() {
    return this.props.gridPlanting?.gridType == "point"
      ? this.props.gridPlanting
      : undefined;
  }

  toggleThreeDGrid = () => {
    if (this.pointGridRequest) {
      this.props.dispatch({
        type: Actions.SET_GRID_PLANTING,
        payload: undefined,
      });
      return;
    }
    const drawnPoint = this.props.drawnPoint;
    if (!drawnPoint) { return; }
    const token = uuid();
    this.props.dispatch({
      type: Actions.SET_GRID_PLANTING,
      payload: {
        token,
        gridId: token,
        gridType: "point",
        itemName: drawnPoint.name,
        defaultSpacing: DEFAULT_POINT_GRID_SPACING,
        radius: DEFAULT_POINT_GRID_RADIUS,
        z: drawnPoint.z,
        meta: {
          color: drawnPoint.color,
          at_soil_level: "" + drawnPoint.at_soil_level,
        },
      },
    });
  };

  toggleGridWithKeyboard = (event: KeyboardEvent) => {
    const target = event.target;
    const enteringText = target instanceof HTMLElement
      && (target.matches("input, textarea, select")
        || target.isContentEditable);
    if (!this.props.is3D
      || this.panel != "points"
      || event.repeat
      || event.defaultPrevented
      || event.ctrlKey
      || event.metaKey
      || event.altKey
      || enteringText
      || event.key.toLowerCase() != "g") {
      return;
    }
    event.preventDefault();
    this.toggleThreeDGrid();
  };

  PointProperties = ({ drawnPoint }: { drawnPoint: DrawnPointPayl }) =>
    <ul className="grid">
      <div className="info-box">
        <div className="row grid-exp-1" style={{ alignItems: "end" }}>
          <div className={"point-name-input grid half-gap"}>
            <label>{t("Name")}</label>
            <BlurableInput
              name="pointName"
              type="text"
              onCommit={this.updateValue("name")}
              value={drawnPoint.name} />
          </div>
          <ColorPicker
            current={drawnPoint.color as ResourceColor}
            onChange={color => this.updateAttr("color", color)} />
        </div>
      </div>
      <ListItem>
        <Row className="add-point-grid">
          <div>
            <label>{t("radius (mm)")}</label>
            <BlurableInput
              name="r"
              type="number"
              onCommit={this.updateValue("r")}
              value={drawnPoint.r}
              min={0} />
          </div>
          <div>
            <label>{t("X")}</label>
            <BlurableInput
              name="cx"
              type="number"
              onCommit={this.updateValue("cx")}
              value={drawnPoint.cx ?? ""} />
          </div>
          <div>
            <label>{t("Y")}</label>
            <BlurableInput
              name="cy"
              type="number"
              onCommit={this.updateValue("cy")}
              value={drawnPoint.cy ?? ""} />
          </div>
          <div>
            <label>{t("Z")}</label>
            <BlurableInput
              name="z"
              type="number"
              onCommit={this.updateValue("z")}
              value={drawnPoint.z ?? ""} />
          </div>
          <UseCurrentLocation botPosition={this.props.botPosition}
            onChange={() => {
              const position = definedPosition(this.props.botPosition);
              if (position) {
                const { x, y, z } = position;
                const payload: DrawnPointPayl = {
                  ...drawnPoint,
                  cx: x,
                  cy: y,
                  z,
                };
                this.setDrawnPoint(payload);
              }
            }} />
        </Row>
      </ListItem>
      {this.panel == "points" &&
        <ListItem>
          <Row className="grid-exp-1">
            <label>{t("at soil level")}</label>
            <input
              name="at_soil_level"
              type="checkbox"
              onChange={e =>
                this.updateAttr("at_soil_level", e.currentTarget.checked)}
              checked={drawnPoint.at_soil_level} />
          </Row>
        </ListItem>}
    </ul>;

  render() {
    const panelType = this.panel == "weeds" ? Panel.Weeds : Panel.Points;
    const pointDescription = this.props.is3D
      ? ""
      : Content.CREATE_POINTS_DESCRIPTION_2D;
    const panelDescription = this.panel == "weeds"
      ? Content.CREATE_WEEDS_DESCRIPTION
      : pointDescription;
    const { drawnPoint } = this.props;
    if (isUndefined(drawnPoint)) { return <></>; }
    return <DesignerPanel panelName={"point-creation"} panel={panelType}>
      <DesignerPanelHeader
        panelName={"point-creation"}
        panel={panelType}
        title={this.panel == "weeds" ? t("Add weed") : t("Add point")}
        backTo={Path.designer(this.panel)}
        description={panelDescription}>
        <div className={"point-creation-header-actions"}>
          {!this.pointGridRequest &&
            <button className="fb-button green save"
              title={t("save")}
              onClick={() => createPoint({
                drawnPoint,
                navigate: this.navigate,
                dispatch: this.props.dispatch,
              })}>
              {t("Save")}
            </button>}
          {panelType == Panel.Points && this.props.is3D &&
            <button
              type={"button"}
              aria-pressed={!!this.pointGridRequest}
              className={[
                "plus-grid-btn",
                "fb-button",
                "clear",
                this.pointGridRequest ? "grid-mode-active" : "",
              ].join(" ")}
              onClick={this.toggleThreeDGrid}>
              + {t("grid")}
            </button>}
        </div>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={"point-creation"}>
        <this.PointProperties drawnPoint={drawnPoint} />
        {panelType == Panel.Points && <hr />}
        {panelType == Panel.Points && !this.props.is3D &&
          <PlantGrid
            xy_swap={this.props.xySwap}
            itemName={drawnPoint.name}
            radius={drawnPoint.r}
            dispatch={this.props.dispatch}
            botPosition={this.props.botPosition}
            z={drawnPoint.z ?? this.props.botPosition.z}
            meta={{
              color: drawnPoint.color,
              at_soil_level: "" + drawnPoint.at_soil_level,
            }}
            open={this.props.legacyPointGrid}
            collapsible={true}
            close={this.closePanel} />}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const CreatePoints = connect(mapStateToProps)(RawCreatePoints);
export default CreatePoints;
