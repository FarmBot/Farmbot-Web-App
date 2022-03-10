import React from "react";
import { Row, Col } from "../ui";
import { BotPosition } from "../devices/interfaces";
import { move } from "../devices/actions";
import { push } from "../history";
import { AxisInputBox } from "../controls/axis_input_box";
import { isNumber } from "lodash";
import { Actions, Content } from "../constants";
import { AxisNumberProperty } from "./map/interfaces";
import { t } from "../i18next_wrapper";
import { SafeZCheckbox } from "../sequences/step_tiles/tile_computed_move/safe_z";
import { Slider } from "@blueprintjs/core";
import { Path } from "../internal_urls";

export interface MoveToFormProps {
  chosenLocation: BotPosition;
  currentBotLocation: BotPosition;
  botOnline: boolean;
  locked: boolean;
}

interface MoveToFormState {
  z: number | undefined;
  safeZ: boolean;
  speed: number;
}

export class MoveToForm extends React.Component<MoveToFormProps, MoveToFormState> {
  state = { z: this.props.chosenLocation.z, safeZ: false, speed: 100 };

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
    const { botOnline, locked } = this.props;
    return <div className={"move-to-form"}>
      <Row>
        <Col xs={3}>
          <label>{t("X AXIS")}</label>
        </Col>
        <Col xs={3}>
          <label>{t("Y AXIS")}</label>
        </Col>
        <Col xs={3}>
          <label>{t("Z AXIS")}</label>
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <input disabled name="x" value={isNumber(x) ? x : "---"} />
        </Col>
        <Col xs={3}>
          <input disabled name="y" value={isNumber(y) ? y : "---"} />
        </Col>
        <AxisInputBox
          onChange={(_, val: number) => this.setState({ z: val })}
          axis={"z"}
          value={this.state.z} />
        <Col xs={3}>
          <button
            onClick={() => {
              move({
                ...this.vector,
                speed: this.state.speed,
                safeZ: this.state.safeZ,
              });
            }}
            className={["fb-button green",
              (botOnline && !locked) ? "" : "pseudo-disabled",
            ].join(" ")}
            title={botOnline
              ? t("Move to this coordinate")
              : t(Content.NOT_AVAILABLE_WHEN_OFFLINE)}>
            {t("GO")}
          </button>
        </Col>
      </Row>
      <Row className={"speed"}>
        <Col xs={3}>
          <label>{t("Speed")}</label>
        </Col>
        <Col xs={9}>
          <Slider min={1} max={100} labelValues={[1, 50, 100]}
            labelRenderer={value => `${value}%`}
            value={this.state.speed}
            onChange={speed => this.setState({ speed })} />
        </Col>
      </Row>
      <SafeZCheckbox checked={this.state.safeZ}
        onChange={() => this.setState({ safeZ: !this.state.safeZ })} />
    </div>;
  }
}

export const MoveModeLink = () =>
  <div className="move-to-mode">
    <button
      className="fb-button gray"
      title={t("open move mode panel")}
      onClick={() => push(Path.location())}>
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
