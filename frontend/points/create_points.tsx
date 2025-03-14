import React from "react";
import { connect } from "react-redux";
import { Everything, ResourceColor } from "../interfaces";
import { initSave } from "../api/crud";
import { Row, BlurableInput, ColorPicker } from "../ui";
import { DrawnPointPayl } from "../farm_designer/interfaces";
import { Actions, Content } from "../constants";
import {
  GenericPointer, WeedPointer,
} from "farmbot/dist/resources/api_resources";
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
import { success } from "../toast/toast";
import { PlantGrid } from "../plants/grid/plant_grid";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import {
  definedPosition, UseCurrentLocation,
} from "../tools/tool_slot_edit_components";
import { BotPosition } from "../devices/interfaces";
import { isUndefined } from "lodash";
import { Path } from "../internal_urls";
import { NavigationContext } from "../routes_helpers";
import { NavigateFunction } from "react-router";
import { Mode } from "../farm_designer/map/interfaces";
import { getMode } from "../farm_designer/map/util";

export function mapStateToProps(props: Everything): CreatePointsProps {
  const { drawnPoint } = props.resources.consumers.farm_designer;
  return {
    dispatch: props.dispatch,
    drawnPoint: drawnPoint,
    xySwap: !!getWebAppConfigValue(() => props)(BooleanSetting.xy_swap),
    botPosition: validBotLocationData(props.bot.hardware.location_data).position,
  };
}

export interface CreatePointProps {
  navigate: NavigateFunction;
  dispatch: Function;
  drawnPoint: DrawnPointPayl;
}

export const createPoint = (props: CreatePointProps) => {
  const { dispatch, drawnPoint, navigate } = props;
  const panel = getMode() == Mode.createWeed ? "weeds" : "points";
  const body: GenericPointer | WeedPointer = {
    pointer_type: panel == "weeds" ? "Weed" : "GenericPointer",
    name: drawnPoint.name ||
      (panel == "weeds"
        ? t("Created Weed")
        : t("Created Point")),
    meta: {
      color: drawnPoint.color,
      created_by: "farm-designer",
      type: panel == "weeds" ? "weed" : "point",
      ...(drawnPoint.at_soil_level ? { at_soil_level: "true" } : {}),
    },
    x: drawnPoint.cx || 0,
    y: drawnPoint.cy || 0,
    z: drawnPoint.z,
    plant_stage: "active",
    radius: drawnPoint.r,
  };
  dispatch(initSave("Point", body));
  success(panel == "weeds"
    ? t("Weed created.")
    : t("Point created."));
  dispatch({
    type: Actions.SET_DRAWN_POINT_DATA,
    payload: undefined,
  });
  navigate(Path.designer(panel));
};

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
  xySwap: boolean;
  botPosition: BotPosition;
}

export class RawCreatePoints extends React.Component<CreatePointsProps> {
  constructor(props: CreatePointsProps) {
    super(props);
    this.state = {};
  }

  get panel() { return Path.getSlug(Path.designer()); }

  componentDidMount() {
    this.props.dispatch(resetDrawnPointDataAction());
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: undefined,
    });
  }

  updateAttr = (key: keyof DrawnPointPayl, value: string | boolean) => {
    const { drawnPoint } = this.props;
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
      this.props.dispatch({
        type: Actions.SET_DRAWN_POINT_DATA,
        payload: drawnPoint,
      });
    }
  };

  updateValue = (key: keyof DrawnPointPayl) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      this.updateAttr(key, value);
    };
  };

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = (url: string) => this.context(url);

  closePanel = () => { this.navigate(Path.designer(this.panel)); };

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
              value={drawnPoint.cx || ""} />
          </div>
          <div>
            <label>{t("Y")}</label>
            <BlurableInput
              name="cy"
              type="number"
              onCommit={this.updateValue("cy")}
              value={drawnPoint.cy || ""} />
          </div>
          <div>
            <label>{t("Z")}</label>
            <BlurableInput
              name="z"
              type="number"
              onCommit={this.updateValue("z")}
              value={drawnPoint.z || ""} />
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
                this.props.dispatch({
                  type: Actions.SET_DRAWN_POINT_DATA,
                  payload,
                });
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
    const panelDescription = this.panel == "weeds"
      ? Content.CREATE_WEEDS_DESCRIPTION
      : Content.CREATE_POINTS_DESCRIPTION;
    const { drawnPoint } = this.props;
    if (isUndefined(drawnPoint)) { return <></>; }
    return <DesignerPanel panelName={"point-creation"} panel={panelType}>
      <DesignerPanelHeader
        panelName={"point-creation"}
        panel={panelType}
        title={this.panel == "weeds" ? t("Add weed") : t("Add point")}
        backTo={Path.designer(this.panel)}
        description={panelDescription}>
        <button className="fb-button green save"
          title={t("save")}
          onClick={() => createPoint({
            drawnPoint,
            navigate: this.navigate as NavigateFunction,
            dispatch: this.props.dispatch,
          })}>
          {t("Save")}
        </button>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={"point-creation"}>
        <this.PointProperties drawnPoint={drawnPoint} />
        {panelType == Panel.Points && <hr />}
        {panelType == Panel.Points &&
          <PlantGrid
            xy_swap={this.props.xySwap}
            itemName={drawnPoint.name}
            radius={drawnPoint.r}
            dispatch={this.props.dispatch}
            botPosition={this.props.botPosition}
            z={drawnPoint.z || this.props.botPosition.z}
            meta={{
              color: drawnPoint.color,
              at_soil_level: "" + drawnPoint.at_soil_level,
            }}
            collapsible={true}
            close={this.closePanel} />}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const CreatePoints = connect(mapStateToProps)(RawCreatePoints);
// eslint-disable-next-line import/no-default-export
export default CreatePoints;
