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

export function mapStateToProps(props: Everything) {
  return {
    dispatch: props.dispatch,
    currentPoint: props.resources.consumers.farm_designer.currentPoint
  };
}

export interface CreatePointsProps {
  dispatch: Function;
  currentPoint: CurrentPointPayl | undefined;
}

interface CreatePointsState {
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

  componentWillReceiveProps() {
    this.getPointData();
  }

  getPointData = () => {
    const point = this.props.currentPoint;
    this.setState({
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
    this.setState({ cx: undefined, cy: undefined, r: undefined, color: undefined });
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

  /** Update number fields. */
  updateNumberValue = (key: keyof Omit<CreatePointsState, "color">) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const value = parseIntInput(e.currentTarget.value);
      this.setState({ [key]: value });
      if (this.props.currentPoint) {
        const point = clone(this.props.currentPoint);
        point[key] = value;
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
      const { cx, cy, r } = this.props.currentPoint;
      this.props.dispatch({
        type: Actions.SET_CURRENT_POINT_DATA,
        payload: { cx, cy, r, color }
      });
    }
    this.forceUpdate();
  }

  createPoint = () => {
    const { cx, cy, r, color } = this.state;
    const body: GenericPointer = {
      pointer_type: "GenericPointer",
      name: "Created Point",
      meta: { color, created_by: "farm-designer" },
      x: (cx || 0),
      y: (cy || 0),
      z: 0,
      radius: (r || 1),
    };
    this.props.dispatch(initSave("Point", body));
    this.cancel();
  }

  PointProperties = () => {
    const { cx, cy, r, color } = this.state;
    return <Row>
      <Col xs={3}>
        <label>{t("X")}</label>
        <BlurableInput
          name="cx"
          type="number"
          onCommit={this.updateNumberValue("cx")}
          value={cx || 0} />
      </Col>
      <Col xs={3}>
        <label>{t("Y")}</label>
        <BlurableInput
          name="cy"
          type="number"
          onCommit={this.updateNumberValue("cy")}
          value={cy || 0} />
      </Col>
      <Col xs={3}>
        <label>{t("radius")}</label>
        <BlurableInput
          name="r"
          type="number"
          onCommit={this.updateNumberValue("r")}
          value={r || 0}
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
        description={Content.CREATE_POINTS_DESCRIPTION} />
      <DesignerPanelContent panelName={"point-creation"}>
        <this.PointProperties />
        <this.PointActions />
        <this.DeleteAllPoints />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
