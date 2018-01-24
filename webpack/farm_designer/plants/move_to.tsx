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
import { Actions } from "../../constants";
import { validBotLocationData } from "../../util/util";

export function mapStateToProps(props: Everything) {
  return {
    chosenLocation: props.resources.consumers.farm_designer.chosenLocation,
    currentBotLocation:
      validBotLocationData(props.bot.hardware.location_data).position,
    dispatch: props.dispatch,
  };
}

export interface MoveToProps {
  chosenLocation: BotPosition;
  currentBotLocation: BotPosition;
  dispatch: Function;
}

interface MoveToState {
  z: number | undefined;
}

@connect(mapStateToProps)
export class MoveTo extends React.Component<MoveToProps, MoveToState> {
  constructor(props: MoveToProps) {
    super(props);
    this.state = { z: undefined };
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: undefined, y: undefined, z: undefined }
    });
  }

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
    return <div
      className="panel-container green-panel move-to-panel">
      <div className="panel-header green-panel">
        <p className="panel-title">
          <i className="fa fa-arrow-left plant-panel-back-arrow"
            onClick={() => history.push("/app/designer/plants")} />
          {t("Move to location")}
        </p>

        <div className="panel-header-description">
          {"Click a spot in the grid to choose a location. " +
            "Once selected, press button to move FarmBot to this postion. " +
            "Press the back arrow to exit."}
        </div>

      </div>

      <div className="panel-content move-to-panel-content">
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
      </div>
    </div>;
  }
}
