import React from "react";
import { connect } from "react-redux";
import { Everything, ResourceColor } from "../interfaces";
import { initSave } from "../api/crud";
import { Row, Col, BlurableInput, ColorPicker } from "../ui";
import { DrawnPointPayl } from "../farm_designer/interfaces";
import { Actions, Content } from "../constants";
import { deletePoints } from "../api/delete_points";
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
import { push } from "../history";
import { ListItem } from "../plants/plant_panel";
import { success } from "../toast/toast";
import { PlantGrid } from "../plants/grid/plant_grid";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import {
  definedPosition, UseCurrentLocation,
} from "../tools/tool_slot_edit_components";
import { BotPosition } from "../devices/interfaces";
import { round } from "lodash";
import { Path } from "../internal_urls";

export function mapStateToProps(props: Everything): CreatePointsProps {
  const { drawnPoint, drawnWeed } = props.resources.consumers.farm_designer;
  return {
    dispatch: props.dispatch,
    drawnPoint: drawnPoint || drawnWeed,
    xySwap: !!getWebAppConfigValue(() => props)(BooleanSetting.xy_swap),
    botPosition: validBotLocationData(props.bot.hardware.location_data).position,
  };
}

export interface CreatePointsProps {
  dispatch: Function;
  drawnPoint: DrawnPointPayl | undefined;
  xySwap: boolean;
  botPosition: BotPosition;
}

type CreatePointsState = Partial<DrawnPointPayl>;

const DEFAULTS: DrawnPointPayl = {
  name: undefined,
  cx: 1,
  cy: 1,
  z: 0,
  r: 15,
  color: undefined,
};

export class RawCreatePoints
  extends React.Component<CreatePointsProps, Partial<CreatePointsState>> {
  constructor(props: CreatePointsProps) {
    super(props);
    this.state = {};
  }

  attr = <T extends (keyof DrawnPointPayl & keyof CreatePointsState)>(key: T,
    fallback = DEFAULTS[key]): DrawnPointPayl[T] => {
    const p = this.props.drawnPoint;
    const userValue = this.state[key] as DrawnPointPayl[T] | undefined;
    const propValue = p ? p[key] : fallback;
    if (typeof userValue === "undefined") {
      return propValue;
    } else {
      return userValue;
    }
  };

  get defaultName() {
    return this.panel == "weeds"
      ? t("Created Weed")
      : t("Created Point");
  }

  get defaultColor() { return this.panel == "weeds" ? "red" : "green"; }

  getPointData = (): DrawnPointPayl => {
    return {
      name: this.attr("name"),
      cx: this.attr("cx"),
      cy: this.attr("cy"),
      z: this.attr("z"),
      r: this.attr("r"),
      color: this.attr("color") || this.defaultColor,
      at_soil_level: this.attr("at_soil_level"),
    };
  };

  cancel = () => {
    this.props.dispatch({
      type: this.panel == "weeds"
        ? Actions.SET_DRAWN_WEED_DATA
        : Actions.SET_DRAWN_POINT_DATA,
      payload: undefined
    });
    this.setState({
      cx: undefined,
      cy: undefined,
      z: undefined,
      r: undefined,
      color: undefined
    });
  };

  loadDefaultPoint = () => {
    this.props.dispatch({
      type: this.panel == "weeds"
        ? Actions.SET_DRAWN_WEED_DATA
        : Actions.SET_DRAWN_POINT_DATA,
      payload: {
        name: this.defaultName,
        cx: this.attr("cx") || DEFAULTS.cx,
        cy: this.attr("cy") || DEFAULTS.cy,
        z: DEFAULTS.z,
        r: DEFAULTS.r,
        color: this.defaultColor,
      } as DrawnPointPayl
    });
  };

  componentDidMount() {
    this.loadDefaultPoint();
  }

  componentWillUnmount() {
    this.cancel();
  }

  updateAttr = (key: keyof CreatePointsState, value: string | boolean) => {
    if (this.props.drawnPoint) {
      const point = this.getPointData();
      switch (key) {
        case "name":
        case "color":
          this.setState({ [key]: value });
          point[key] = "" + value;
          break;
        case "at_soil_level":
          this.setState({ [key]: !!value });
          point[key] = !!value;
          break;
        default:
          const intValue = parseIntInput("" + value);
          this.setState({ [key]: intValue });
          point[key] = intValue;
      }
      this.props.dispatch({
        type: this.panel == "weeds"
          ? Actions.SET_DRAWN_WEED_DATA
          : Actions.SET_DRAWN_POINT_DATA,
        payload: point
      });
    }
  };

  /** Update fields. */
  updateValue = (key: keyof CreatePointsState) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      this.updateAttr(key, value);
    };
  };

  changeColor = (color: ResourceColor) => {
    this.setState({ color });
    const point = this.getPointData();
    point.color = color;
    this.props.dispatch({
      type: this.panel == "weeds"
        ? Actions.SET_DRAWN_WEED_DATA
        : Actions.SET_DRAWN_POINT_DATA,
      payload: point
    });
  };

  get panel() { return Path.getSlug(Path.designer()) || "points"; }

  createPoint = () => {
    const body: GenericPointer | WeedPointer = {
      pointer_type: this.panel == "weeds" ? "Weed" : "GenericPointer",
      name: this.attr("name") || this.defaultName,
      meta: {
        color: this.attr("color") || this.defaultColor,
        created_by: "farm-designer",
        type: this.panel == "weeds" ? "weed" : "point",
        ...(this.attr("at_soil_level") ? { at_soil_level: "true" } : {}),
      },
      x: this.attr("cx"),
      y: this.attr("cy"),
      z: this.attr("z"),
      plant_stage: "active",
      radius: this.attr("r"),
    };
    this.props.dispatch(initSave("Point", body));
    success(this.panel == "weeds"
      ? t("Weed created.")
      : t("Point created."));
    this.cancel();
    this.closePanel();
  };

  closePanel = () => push(Path.designer(this.panel));

  PointProperties = () =>
    <ul>
      <li>
        <Row>
          <div className={"point-name-input"}>
            <Col xs={10}>
              <label>{t("Name")}</label>
              <BlurableInput
                name="name"
                type="text"
                onCommit={this.updateValue("name")}
                value={this.attr("name") || this.defaultName} />
            </Col>
          </div>
          <div className={"point-color-input"}>
            <Col xs={2}>
              <ColorPicker
                current={(this.attr("color") || this.defaultColor) as ResourceColor}
                onChange={this.changeColor} />
            </Col>
          </div>
        </Row>
      </li>
      <ListItem>
        <Row>
          <Col xs={3}>
            <label>{t("X (mm)")}</label>
            <BlurableInput
              name="cx"
              type="number"
              onCommit={this.updateValue("cx")}
              value={this.attr("cx", this.props.botPosition.x)} />
          </Col>
          <Col xs={3}>
            <label>{t("Y (mm)")}</label>
            <BlurableInput
              name="cy"
              type="number"
              onCommit={this.updateValue("cy")}
              value={this.attr("cy", this.props.botPosition.y)} />
          </Col>
          <Col xs={3}>
            <label>{t("Z (mm)")}</label>
            <BlurableInput
              name="z"
              type="number"
              onCommit={this.updateValue("z")}
              value={this.attr("z", this.props.botPosition.z)} />
          </Col>
          <UseCurrentLocation botPosition={this.props.botPosition}
            onChange={() => {
              const position = definedPosition(this.props.botPosition);
              if (position) {
                const { x, y, z } = position;
                this.setState({ cx: round(x), cy: round(y), z: round(z) }, () =>
                  this.props.dispatch({
                    type: this.panel == "weeds"
                      ? Actions.SET_DRAWN_WEED_DATA
                      : Actions.SET_DRAWN_POINT_DATA,
                    payload: this.getPointData(),
                  }));
              }
            }} />
        </Row>
      </ListItem>
      <ListItem>
        <Row>
          <Col xs={6}>
            <label>{t("radius (mm)")}</label>
            <BlurableInput
              name="r"
              type="number"
              onCommit={this.updateValue("r")}
              value={this.attr("r")}
              min={0} />
          </Col>
        </Row>
      </ListItem>
      {this.panel == "points" &&
        <ListItem>
          <Row>
            <Col xs={6} className={"soil-height-checkbox"}>
              <label>{t("at soil level")}</label>
              <input
                name="at_soil_level"
                type="checkbox"
                onChange={e =>
                  this.updateAttr("at_soil_level", e.currentTarget.checked)}
                checked={!!this.attr("at_soil_level")} />
            </Col>
          </Row>
        </ListItem>}
    </ul>;

  PointActions = () =>
    <Row>
      <button className="fb-button green"
        title={t("save")}
        onClick={this.createPoint}>
        {t("Save")}
      </button>
    </Row>;

  DeleteAllPoints = (type: "point" | "weed") => {
    const meta = { created_by: "farm-designer" };
    return <Row>
      <div className="delete-row">
        <label>{t("delete")}</label>
        <p>{type === "weed"
          ? t("Delete all of the weeds created through this panel.")
          : t("Delete all of the points created through this panel.")}</p>
        <button className="fb-button red delete"
          title={t("delete all")}
          onClick={() => {
            if (confirm(type === "weed"
              ? t("Delete all the weeds you have created?")
              : t("Delete all the points you have created?"))) {
              this.props.dispatch(deletePoints("points", {
                pointer_type: type === "weed" ? "Weed" : "GenericPointer",
                meta,
              }));
              this.cancel();
            }
          }}>
          {type === "weed"
            ? t("Delete all created weeds")
            : t("Delete all created points")}
        </button>
      </div>
    </Row>;
  };

  render() {
    const panelType = this.panel == "weeds" ? Panel.Weeds : Panel.Points;
    const panelDescription = this.panel == "weeds"
      ? Content.CREATE_WEEDS_DESCRIPTION
      : Content.CREATE_POINTS_DESCRIPTION;
    const point = this.getPointData();
    const meta: Record<string, string | undefined> = { color: point.color };
    point.at_soil_level && (meta.at_soil_level = "" + point.at_soil_level);
    return <DesignerPanel panelName={"point-creation"} panel={panelType}>
      <DesignerPanelHeader
        panelName={"point-creation"}
        panel={panelType}
        title={this.panel == "weeds" ? t("Add weed") : t("Add point")}
        backTo={Path.designer(this.panel)}
        description={panelDescription} />
      <DesignerPanelContent panelName={"point-creation"}>
        <this.PointProperties />
        <this.PointActions />
        {panelType == Panel.Points &&
          <PlantGrid
            xy_swap={this.props.xySwap}
            itemName={point.name || t("Grid point")}
            radius={point.r}
            dispatch={this.props.dispatch}
            botPosition={this.props.botPosition}
            z={this.attr("z", this.props.botPosition.z)}
            meta={meta}
            close={this.closePanel} />}
        <hr />
        {this.DeleteAllPoints(this.panel == "weeds" ? "weed" : "point")}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const CreatePoints = connect(mapStateToProps)(RawCreatePoints);
