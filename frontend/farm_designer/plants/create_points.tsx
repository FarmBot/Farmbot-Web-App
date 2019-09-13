import * as React from "react";
import { connect } from "react-redux";
import { Everything, ResourceColor } from "../../interfaces";
import { initSave } from "../../api/crud";
import {
  Row, Col, BlurableInput, ColorPicker
} from "../../ui/index";
import { CurrentPointPayl } from "../interfaces";
import { Actions, Content } from "../../constants";
import { deletePoints } from "../../farmware/weed_detector/actions";
import { clone } from "lodash";
import { GenericPointer } from "farmbot/dist/resources/api_resources";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
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

interface CreatePointsState {
  name: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
}

@connect(mapStateToProps)
export class CreatePoints
  extends React.Component<CreatePointsProps, Partial<CreatePointsState>> {
  constructor(props: CreatePointsProps) {
    super(props);
    this.state = {};
  }

  UNSAFE_componentWillReceiveProps() {
    this.getPointData();
  }

  getPointData = () => {
    const point = this.props.currentPoint;
    this.setState({
      name: point ? point.name : "Created Point",
      cx: point ? point.cx : 0,
      cy: point ? point.cy : 0,
      r: point ? point.r : 1,
      color: point ? point.color : "green"
    });
  }

  cancel = () => {
    this.props.dispatch({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: undefined
    });
    this.setState({
      cx: undefined, cy: undefined, r: undefined, color: undefined
    });
  }

  componentWillUnmount() {
    this.cancel();
  }

  updateCurrentPoint = () => {
    this.props.dispatch({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: this.state
    });
  }

  /** Update fields. */
  updateValue = (key: keyof CreatePointsState) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      this.setState({ [key]: value });
      if (this.props.currentPoint) {
        const point = clone(this.props.currentPoint);
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
    if (this.props.currentPoint) {
      const { cx, cy, r, name } = this.props.currentPoint;
      this.props.dispatch({
        type: Actions.SET_CURRENT_POINT_DATA,
        payload: { cx, cy, r, color, name }
      });
    }
    this.forceUpdate();
  }

  createPoint = () => {
    const { cx, cy, r, color, name } = this.state;
    const body: GenericPointer = {
      pointer_type: "GenericPointer",
      name: name || "Created Point",
      meta: { color, created_by: "farm-designer" },
      x: cx || 0,
      y: cy || 0,
      z: 0,
      radius: r || 1,
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
          value={this.state.name || "Created Point"} />
      </Col>
    </Row>;

  PointProperties = () => {
    const { cx, cy, r, color } = this.state;
    return <Row>
      <Col xs={3}>
        <label>{t("X")}</label>
        <BlurableInput
          name="cx"
          type="number"
          onCommit={this.updateValue("cx")}
          value={cx || this.props.deviceX} />
      </Col>
      <Col xs={3}>
        <label>{t("Y")}</label>
        <BlurableInput
          name="cy"
          type="number"
          onCommit={this.updateValue("cy")}
          value={cy || this.props.deviceY} />
      </Col>
      <Col xs={3}>
        <label>{t("radius")}</label>
        <BlurableInput
          name="r"
          type="number"
          onCommit={this.updateValue("r")}
          value={(typeof r == "number") ? r : 20}
          min={0} />
      </Col>
      <Col xs={3}>
        <label>{t("color")}</label>
        <ColorPicker
          current={color as ResourceColor || "green"}
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
