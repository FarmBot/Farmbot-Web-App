import React from "react";
import { connect } from "react-redux";
import {
  Everything,
  ResourceColor,
} from "../interfaces";
import { initSave } from "../api/crud";
import {
  Row,
  Col,
  BlurableInput,
  ColorPicker,
} from "../ui/index";
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
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { push, getPathArray } from "../history";
import { ListItem } from "../plants/plant_panel";
import { success } from "../toast/toast";
import { PlantGrid } from "../plants/grid/plant_grid";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";

export function mapStateToProps(props: Everything): CreatePointsProps {
  const { position } = props.bot.hardware.location_data;
  const { drawnPoint, drawnWeed } = props.resources.consumers.farm_designer;
  return {
    dispatch: props.dispatch,
    drawnPoint: drawnPoint || drawnWeed,
    deviceX: position.x || 0,
    deviceY: position.y || 0,
    xySwap: !!getWebAppConfigValue(() => props)(BooleanSetting.xy_swap),
  };
}

export interface CreatePointsProps {
  dispatch: Function;
  drawnPoint: DrawnPointPayl | undefined;
  deviceX: number;
  deviceY: number;
  xySwap: boolean;
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
    };
  }

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
  }

  loadDefaultPoint = () => {
    this.props.dispatch({
      type: this.panel == "weeds"
        ? Actions.SET_DRAWN_WEED_DATA
        : Actions.SET_DRAWN_POINT_DATA,
      payload: {
        name: this.defaultName,
        cx: DEFAULTS.cx,
        cy: DEFAULTS.cy,
        z: DEFAULTS.z,
        r: DEFAULTS.r,
        color: this.defaultColor,
      } as DrawnPointPayl
    });
  }

  componentDidMount() {
    this.loadDefaultPoint();
  }

  componentWillUnmount() {
    this.cancel();
  }

  /** Update fields. */
  updateValue = (key: keyof CreatePointsState) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      if (this.props.drawnPoint) {
        const point = this.getPointData();
        switch (key) {
          case "name":
          case "color":
            this.setState({ [key]: value });
            point[key] = value;
            break;
          default:
            const intValue = parseIntInput(value);
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
  }

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
  }

  get panel() { return getPathArray()[3] || "points"; }

  createPoint = () => {
    const body: GenericPointer | WeedPointer = {
      pointer_type: this.panel == "weeds" ? "Weed" : "GenericPointer",
      name: this.attr("name") || this.defaultName,
      meta: {
        color: this.attr("color") || this.defaultColor,
        created_by: "farm-designer",
        type: this.panel == "weeds" ? "weed" : "point",
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
  }

  closePanel = () => push(`/app/designer/${this.panel}`);

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
      <ListItem name={t("Location")}>
        <Row>
          <Col xs={4}>
            <label>{t("X (mm)")}</label>
            <BlurableInput
              name="cx"
              type="number"
              onCommit={this.updateValue("cx")}
              value={this.attr("cx", this.props.deviceX)} />
          </Col>
          <Col xs={4}>
            <label>{t("Y (mm)")}</label>
            <BlurableInput
              name="cy"
              type="number"
              onCommit={this.updateValue("cy")}
              value={this.attr("cy", this.props.deviceY)} />
          </Col>
          <Col xs={4}>
            <label>{t("Z (mm)")}</label>
            <BlurableInput
              name="z"
              type="number"
              onCommit={this.updateValue("z")}
              value={this.attr("z", this.props.deviceY)} />
          </Col>
        </Row>
      </ListItem>
      <ListItem name={t("Size")}>
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
    </ul>

  PointActions = () =>
    <Row>
      <button className="fb-button green"
        title={t("save")}
        onClick={this.createPoint}>
        {t("Save")}
      </button>
    </Row>

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
    return <DesignerPanel panelName={"point-creation"} panel={panelType}>
      <DesignerPanelHeader
        panelName={"point-creation"}
        panel={panelType}
        title={this.panel == "weeds" ? t("Add weed") : t("Add point")}
        backTo={`/app/designer/${this.panel}`}
        description={panelDescription} />
      <DesignerPanelContent panelName={"point-creation"}>
        <this.PointProperties />
        <this.PointActions />
        {panelType == Panel.Points &&
          <PlantGrid
            xy_swap={this.props.xySwap}
            itemName={point.name || t("Grid point")}
            color={point.color}
            radius={point.r}
            dispatch={this.props.dispatch}
            botPosition={{ x: this.props.deviceX, y: this.props.deviceY, z: 0 }}
            close={this.closePanel} />}
        <hr />
        {this.DeleteAllPoints(this.panel == "weeds" ? "weed" : "point")}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const CreatePoints = connect(mapStateToProps)(RawCreatePoints);
