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
} from "./designer_panel";
import { parseIntInput } from "../../util";
import { t } from "../../i18next_wrapper";

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
  name: "Created Point",
  cx: 1,
  cy: 1,
  r: 15,
  color: "red"
};

@connect(mapStateToProps)
export class CreatePoints
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

  getPointData = (): CurrentPointPayl => {
    return {
      name: this.attr("name"),
      cx: this.attr("cx"),
      cy: this.attr("cy"),
      r: this.attr("r"),
      color: this.attr("color"),
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
      r: DEFAULTS.r,
      color: undefined
    });
  }

  componentWillUnmount() {
    this.cancel();
  }

  updateCurrentPoint = () => {
    this.props.dispatch({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: this.getPointData()
    });
  }

  /** Update fields. */
  updateValue = (key: keyof CreatePointsState) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      this.setState({ [key]: value });
      if (this.props.currentPoint) {
        const point = this.getPointData();
        switch (key) {
          case "name":
          case "color":
            point[key] = value;
            break;
          default:
            point[key] = parseIntInput(value);
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
    this.props.dispatch({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: this.getPointData()
    });
  }

  createPoint = () => {
    const body: GenericPointer = {
      pointer_type: "GenericPointer",
      name: this.attr("name") || "Created Point",
      meta: {
        color: this.attr("color"),
        created_by: "farm-designer"
      },
      x: this.attr("cx"),
      y: this.attr("cy"),
      z: 0,
      radius: this.attr("r"),
    };
    this.props.dispatch(initSave("Point", body));
    this.cancel();
  }

  PointName = () =>
    <Row>
      <Col xs={12}>
        <label>{t("Name")}</label>
        <BlurableInput
          name="name"
          type="text"
          onCommit={this.updateValue("name")}
          value={this.attr("name") || ""} />
      </Col>
    </Row>;

  PointProperties = () => {
    return <Row>
      <Col xs={3}>
        <label>{t("X")}</label>
        <BlurableInput
          name="cx"
          type="number"
          onCommit={this.updateValue("cx")}
          value={this.attr("cx", this.props.deviceX)} />
      </Col>
      <Col xs={3}>
        <label>{t("Y")}</label>
        <BlurableInput
          name="cy"
          type="number"
          onCommit={this.updateValue("cy")}
          value={this.attr("cy", this.props.deviceY)} />
      </Col>
      <Col xs={3}>
        <label>{t("radius")}</label>
        <BlurableInput
          name="r"
          type="number"
          onCommit={this.updateValue("r")}
          value={this.attr("r", DEFAULTS.r)}
          min={0} />
      </Col>
      <Col xs={3}>
        <label>{t("color")}</label>
        <ColorPicker
          current={this.attr("color") as ResourceColor}
          onChange={this.changeColor} />
      </Col>
    </Row>;
  }

  PointActions = () =>
    <Row>
      <button className="fb-button green"
        onClick={this.createPoint}>
        {t("Create point")}
      </button>
      <button className="fb-button yellow"
        onClick={this.updateCurrentPoint}>
        {t("Update")}
      </button>
      <button className="fb-button gray"
        onClick={this.cancel}>
        {t("Cancel")}
      </button>
    </Row>

  DeleteAllPoints = () =>
    <Row>
      <div className="delete-row">
        <label>{t("delete")}</label>
        <p>{t("Delete all of the points created through this panel.")}</p>
        <button className="fb-button red delete"
          onClick={() => {
            if (confirm(t("Delete all the points you have created?"))) {
              this.props.dispatch(deletePoints("points", "farm-designer"));
              this.cancel();
            }
          }}>
          {t("Delete all created points")}
        </button>
      </div>
    </Row>

  render() {
    return <DesignerPanel panelName={"point-creation"} panelColor={"brown"}>
      <DesignerPanelHeader
        panelName={"point-creation"}
        panelColor={"brown"}
        title={t("Create point")}
        backTo={"/app/designer/points"}
        description={Content.CREATE_POINTS_DESCRIPTION} />
      <DesignerPanelContent panelName={"point-creation"}>
        <this.PointName />
        <this.PointProperties />
        <this.PointActions />
        <this.DeleteAllPoints />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
