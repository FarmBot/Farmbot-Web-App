import * as React from "react";
import { Row, Col } from "../../ui/index";
import { Everything } from "../../interfaces";
import { BotPosition } from "../../devices/interfaces";
import { connect } from "react-redux";
import { t } from "i18next";
import { moveAbs } from "../../devices/actions";
import { history } from "../../history";
import { AxisInputBox } from "../../controls/axis_input_box";
import { isNumber } from "lodash";
import { Actions, Content } from "../../constants";
import { validBotLocationData } from "../../util/util";
import { unselectPlant } from "../actions";
import { AxisNumberProperty } from "../map/interfaces";

export function mapStateToProps(props: Everything) {
  return {
    chosenLocation: props.resources.consumers.farm_designer.chosenLocation,
    currentBotLocation:
      validBotLocationData(props.bot.hardware.location_data).position,
    dispatch: props.dispatch,
  };
}

export interface MoveToFormProps {
  chosenLocation: BotPosition;
  currentBotLocation: BotPosition;
}

export interface MoveToProps extends MoveToFormProps {
  dispatch: Function;
}

interface MoveToFormState {
  z: number | undefined;
}

export class MoveToForm extends React.Component<MoveToFormProps, MoveToFormState> {
  state = { z: undefined };

  get vector(): { x: number, y: number, z: number } {
    const { chosenLocation } = this.props;
    const newX = chosenLocation.x;
    const newY = chosenLocation.y;
    const { x, y, z } = this.props.currentBotLocation;
    const inputZ = this.state.z;
    return {
      x: isNumber(newX) ? newX : (x || 0),
      y: isNumber(newY) ? newY : (y || 0),
      z: isNumber(inputZ) ? inputZ : (z || 0),
    };
  }

  render() {
    const { x, y } = this.props.chosenLocation;
    return <div>
      <Row>
        <Col xs={4}>
          <label>{t("X AXIS")}</label>
        </Col>
        <Col xs={4}>
          <label>{t("Y AXIS")}</label>
        </Col>
        <Col xs={4}>
          <label>{t("Z AXIS")}</label>
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <input disabled value={isNumber(x) ? x : "---"} />
        </Col>
        <Col xs={4}>
          <input disabled value={isNumber(y) ? y : "---"} />
        </Col>
        <AxisInputBox
          onChange={(_, val: number) => this.setState({ z: val })}
          axis={"z"}
          value={this.state.z} />
        <Row>
          <button
            onClick={() => moveAbs(this.vector)}
            disabled={false}
            className="fb-button gray" >
            {t("Move to this coordinate")}
          </button>
        </Row>
      </Row>
    </div>;
  }
}

@connect(mapStateToProps)
export class MoveTo extends React.Component<MoveToProps, {}> {

  componentDidMount() {
    unselectPlant(this.props.dispatch)();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: undefined, y: undefined, z: undefined }
    });
  }

  render() {
    return <div
      className="panel-container green-panel move-to-panel">
      <div className="panel-header green-panel">
        <p className="panel-title">
          <i className="fa fa-arrow-left plant-panel-back-arrow"
            onClick={() => history.push("/app/designer/plants")} />
          {t("Move to location")}
        </p>

        <div className="panel-header-description">
          {t(Content.MOVE_MODE_DESCRIPTION)}
        </div>
      </div>

      <div className="panel-content move-to-panel-content">
        <MoveToForm
          chosenLocation={this.props.chosenLocation}
          currentBotLocation={this.props.currentBotLocation} />
      </div>
    </div>;
  }
}

export const MoveModeLink = () =>
  <div className="move-to-mode">
    <button
      className="fb-button gray"
      onClick={() => history.push("/app/designer/plants/move_to")}>
      {t("move mode")}
    </button>
  </div>;

/** Mark a new bot target location on the map. */
export const chooseLocation = (props: {
  gardenCoords: AxisNumberProperty | undefined,
  dispatch: Function,
}) => {
  if (props.gardenCoords) {
    props.dispatch({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: props.gardenCoords.x, y: props.gardenCoords.y, z: 0 }
    });
  }
};
