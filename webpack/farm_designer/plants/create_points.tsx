import * as React from "react";
import { t } from "i18next";
import { connect } from "react-redux";
import { Everything, Color } from "../../interfaces";
import { initSave } from "../../api/crud";
import {
  BackArrow, Row, Col, BlurableInput, ColorPicker
} from "../../ui/index";
import { CurrentPointPayl } from "../interfaces";
import { Actions } from "../../constants";
import { TaggedPoint, SpecialStatus } from "../../resources/tagged_resources";
import { deletePoints } from "../../farmware/weed_detector/actions";
import { clone } from "lodash";

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

  update = (key: keyof CreatePointsState) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const value = parseInt(e.currentTarget.value);
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

  changeColor = (color: Color) => {
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
    const p: TaggedPoint = {
      kind: "Point",
      uuid: "",
      specialStatus: SpecialStatus.SAVED,
      body: {
        pointer_type: "GenericPointer",
        name: "Created Point",
        meta: { color, created_by: "farm-designer" },
        x: (cx || 0),
        y: (cy || 0),
        z: 0,
        radius: (r || 1),
      }
    };
    this.props.dispatch(initSave(p));
    this.cancel();
  }

  render() {
    const { cx, cy, r, color } = this.state;
    return <div
      className="panel-container brown-panel point-creation-panel">
      <div className="panel-header brown-panel">
        <p className="panel-title">
          <BackArrow />
          {t("Create point")}
        </p>
        <div className="panel-header-description">
          {"Click and drag to draw a point or use the inputs and press " +
            "update. Press CREATE POINT to save, or the back arrow to exit."}
        </div>
      </div>

      <div className="panel-content">
        <Row>
          <Col xs={3}>
            <label>{t("X")}</label>
            <BlurableInput
              name="cx"
              type="number"
              onCommit={this.update("cx")}
              value={cx || 0} />
          </Col>
          <Col xs={3}>
            <label>{t("Y")}</label>
            <BlurableInput
              name="cy"
              type="number"
              onCommit={this.update("cy")}
              value={cy || 0} />
          </Col>
          <Col xs={3}>
            <label>{t("radius")}</label>
            <BlurableInput
              name="r"
              type="number"
              onCommit={this.update("r")}
              value={r || 0} />
          </Col>
          <Col xs={3}>
            <label>{t("color")}</label>
            <ColorPicker
              current={color as Color || "green"}
              onChange={this.changeColor} />
          </Col>
        </Row>
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
        <Row>
          <div className="delete-row">
            <label>{t("delete")}</label>
            <p>{t("Delete all of the points created through this panel.")}</p>
            <button className="fb-button red delete"
              onClick={() => {
                if (confirm("Delete all the points you have created?")) {
                  this.props.dispatch(deletePoints("points", "farm-designer"));
                  this.cancel();
                }
              }}>
              {t("Delete all created points")}
            </button>
          </div>
        </Row>
      </div>
    </div>;
  }
}
