import * as React from "react";
import { connect } from "react-redux";
import {
  Everything,
  ResourceColor
} from "../../interfaces";
import { initSave } from "../../api/crud";
import {
  Row,
  Col,
  BlurableInput,
  ColorPicker
} from "../../ui/index";
import { CurrentPointPayl } from "../interfaces";
import { Actions, Content } from "../../constants";
import { deletePoints } from "../../farmware/weed_detector/actions";
import { GenericPointer } from "farmbot/dist/resources/api_resources";
import {
  DesignerPanel,
  DesignerPanelHeader,
  DesignerPanelContent
} from "../designer_panel";
import { parseIntInput } from "../../util";
import { t } from "../../i18next_wrapper";
import { Panel } from "../panel_header";
import { history, getPathArray } from "../../history";
import { ListItem } from "../plants/plant_panel";
import { success } from "../../toast/toast";

export function mapStateToProps(props: Everything): CreatePointsProps {
  const { position } = props.bot.hardware.location_data;
  return {
    dispatch: props.dispatch,
    currentPoint: props.resources.consumers.farm_designer.currentPoint,
    deviceX: position.x || 0,
    deviceY: position.y || 0,
  };
}

export interface CreatePointsProps {
  dispatch: Function;
  currentPoint: CurrentPointPayl | undefined;
  deviceX: number;
  deviceY: number;
}

type CreatePointsState = Partial<CurrentPointPayl>;

const DEFAULTS: CurrentPointPayl = {
  name: undefined,
  cx: 1,
  cy: 1,
  r: 15,
  color: undefined,
};

export class RawCreatePoints
  extends React.Component<CreatePointsProps, Partial<CreatePointsState>> {
  constructor(props: CreatePointsProps) {
    super(props);
    this.state = {};
  }

  attr = <T extends (keyof CurrentPointPayl & keyof CreatePointsState)>(key: T,
    fallback = DEFAULTS[key]): CurrentPointPayl[T] => {
    const p = this.props.currentPoint;
    const userValue = this.state[key] as CurrentPointPayl[T] | undefined;
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

  getPointData = (): CurrentPointPayl => {
    return {
      name: this.attr("name"),
      cx: this.attr("cx"),
      cy: this.attr("cy"),
      r: this.attr("r"),
      color: this.attr("color") || this.defaultColor,
    };
  }

  cancel = () => {
    this.props.dispatch({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: undefined
    });
    this.setState({
      cx: undefined,
      cy: undefined,
      r: undefined,
      color: undefined
    });
  }

  loadDefaultPoint = () => {
    this.props.dispatch({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: {
        name: this.defaultName,
        cx: DEFAULTS.cx,
        cy: DEFAULTS.cy,
        r: DEFAULTS.r,
        color: this.defaultColor,
      } as CurrentPointPayl
    });
  }

  UNSAFE_componentWillMount() {
    this.loadDefaultPoint();
  }

  componentWillUnmount() {
    this.cancel();
  }

  /** Update fields. */
  updateValue = (key: keyof CreatePointsState) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      if (this.props.currentPoint) {
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
          type: Actions.SET_CURRENT_POINT_DATA,
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
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: point
    });
  }

  get panel() { return getPathArray()[3] || "points"; }

  createPoint = () => {
    const body: GenericPointer = {
      pointer_type: "GenericPointer",
      name: this.attr("name") || this.defaultName,
      meta: {
        color: this.attr("color") || this.defaultColor,
        created_by: "farm-designer",
        type: this.panel == "weeds" ? "weed" : "point",
      },
      x: this.attr("cx"),
      y: this.attr("cy"),
      z: 0,
      radius: this.attr("r"),
    };
    this.props.dispatch(initSave("Point", body));
    success(this.panel == "weeds"
      ? t("Weed created.")
      : t("Point created."));
    this.cancel();
    history.push(`/app/designer/${this.panel}`);
  }

  PointProperties = () =>
    <ul>
      <li>
        <div>
          <label>{t("Name")}</label>
          <BlurableInput
            name="name"
            type="text"
            onCommit={this.updateValue("name")}
            value={this.attr("name") || this.defaultName} />
        </div>
      </li>
      <ListItem name={t("Location")}>
        <Row>
          <Col xs={6}>
            <label>{t("X (mm)")}</label>
            <BlurableInput
              name="cx"
              type="number"
              onCommit={this.updateValue("cx")}
              value={this.attr("cx", this.props.deviceX)} />
          </Col>
          <Col xs={6}>
            <label>{t("Y (mm)")}</label>
            <BlurableInput
              name="cy"
              type="number"
              onCommit={this.updateValue("cy")}
              value={this.attr("cy", this.props.deviceY)} />
          </Col>
        </Row>
      </ListItem>
      <ListItem name={t("Size")}>
        <Row>
          <Col xs={6}>
            <label>{t("radius")}</label>
            <BlurableInput
              name="r"
              type="number"
              onCommit={this.updateValue("r")}
              value={this.attr("r")}
              min={0} />
          </Col>
        </Row>
      </ListItem>
      <ListItem name={t("Color")}>
        <Row>
          <ColorPicker
            current={(this.attr("color") || this.defaultColor) as ResourceColor}
            onChange={this.changeColor} />
        </Row>
      </ListItem>
    </ul>

  PointActions = () =>
    <Row>
      <button className="fb-button green"
        onClick={this.createPoint}>
        {t("Save")}
      </button>
    </Row>

  DeleteAllPoints = (type: "point" | "weed") =>
    <Row>
      <div className="delete-row">
        <label>{t("delete")}</label>
        <p>{type === "weed"
          ? t("Delete all of the weeds created through this panel.")
          : t("Delete all of the points created through this panel.")}</p>
        <button className="fb-button red delete"
          onClick={() => {
            if (confirm(type === "weed"
              ? t("Delete all the weeds you have created?")
              : t("Delete all the points you have created?"))) {
              this.props.dispatch(deletePoints("points", {
                created_by: "farm-designer", type,
              }));
              this.cancel();
            }
          }}>
          {type === "weed"
            ? t("Delete all created weeds")
            : t("Delete all created points")}
        </button>
      </div>
    </Row>

  render() {
    const panelType = this.panel == "weeds" ? Panel.Weeds : Panel.Points;
    const panelDescription = this.panel == "weeds" ?
      Content.CREATE_WEEDS_DESCRIPTION : Content.CREATE_POINTS_DESCRIPTION;
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
        {this.DeleteAllPoints(this.panel == "weeds" ? "weed" : "point")}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const CreatePoints = connect(mapStateToProps)(RawCreatePoints);
