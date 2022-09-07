import React from "react";
import { Row, Col, Popover } from "../ui";
import { BotPosition } from "../devices/interfaces";
import { move } from "../devices/actions";
import { push } from "../history";
import { AxisInputBox } from "../controls/axis_input_box";
import { isNumber, sum } from "lodash";
import { Actions, Content } from "../constants";
import { AxisNumberProperty } from "./map/interfaces";
import { t } from "../i18next_wrapper";
import { SafeZCheckbox } from "../sequences/step_tiles/tile_computed_move/safe_z";
import { Position, Slider } from "@blueprintjs/core";
import { Path } from "../internal_urls";
import { setMovementStateFromPosition } from "../connectivity/log_handlers";
import { Vector3, Xyz } from "farmbot";
import { Link } from "../link";
import {
  GetWebAppConfigValue, setWebAppConfigValue,
} from "../config_storage/actions";
import { StringSetting } from "../session_keys";
import { MovementState } from "../interfaces";

export interface MoveToFormProps {
  chosenLocation: BotPosition;
  currentBotLocation: BotPosition;
  botOnline: boolean;
  locked: boolean;
  dispatch: Function;
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
              this.props.dispatch(setMovementStateFromPosition(
                this.props.currentBotLocation, this.vector));
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
    props.dispatch(chooseLocationAction({
      x: props.gardenCoords.x, y: props.gardenCoords.y, z: 0
    }));
  }
};

type GoButtonAxes = "X" | "Y" | "Z" | "XY" | "XYZ";
const GO_BUTTON_AXES: GoButtonAxes[] = ["X", "Y", "Z", "XY", "XYZ"];

export interface GoToThisLocationButtonProps {
  defaultAxes: string;
  locationCoordinate: Vector3;
  botOnline: boolean;
  arduinoBusy: boolean;
  dispatch: Function;
  currentBotLocation: BotPosition;
  movementState: MovementState;
}

interface GoToThisLocationButtonState {
  open: boolean;
  setAsDefault: boolean;
}

export class GoToThisLocationButton
  extends React.Component<GoToThisLocationButtonProps,
  GoToThisLocationButtonState> {
  state: GoToThisLocationButtonState = { open: false, setAsDefault: false };

  toggle = (key: keyof GoToThisLocationButtonState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });

  render() {
    const goText = (axes: string) => `${t("GO")} (${axes.split("").join(", ")})`;
    const current = this.props.currentBotLocation;
    const target = this.props.locationCoordinate;
    const { arduinoBusy, botOnline, dispatch, defaultAxes } = this.props;
    const unavailableContent = () => {
      if (arduinoBusy) { return t("FarmBot is busy"); }
      if (!botOnline) { return t("FarmBot is offline"); }
    };
    const unavailable = arduinoBusy || !botOnline;
    const classes = (className: string) => [
      className,
      "fb-button gray",
      unavailable ? "pseudo-disabled" : "",
    ].join(" ");
    const defaultDestination = coordinateFromAxes(target, current, defaultAxes);
    const remaining = movementPercentRemaining(current, this.props.movementState);
    return <div className={"go-button-axes-wrapper"}>
      <button
        className={classes("go-button-axes-text")}
        title={goText(this.props.defaultAxes)}
        onMouseEnter={() => dispatch(chooseLocationAction(defaultDestination))}
        onMouseLeave={() => dispatch(unChooseLocationAction())}
        onClick={() => {
          if (unavailable) {
            this.toggle("open")();
            return;
          }
          dispatch(setMovementStateFromPosition(current, defaultDestination));
          move(defaultDestination);
          this.setState({ open: false });
        }}>
        {remaining && !isNaN(remaining) && arduinoBusy
          ? <div className={"movement-progress"}
            style={{ width: `${remaining}%`, top: 0, left: 0 }} />
          : <i />}
        <p>{goText(this.props.defaultAxes)}</p>
      </button>
      <Popover position={Position.BOTTOM_RIGHT}
        isOpen={this.state.open}
        className={"go-button-axes"}
        popoverClassName={"go-button-axes-popover"}
        target={<button
          className={classes("go-button-axes-dropdown")}
          title={t("options")}
          onClick={this.toggle("open")}>
          <i className={"fa fa-chevron-down"} />
        </button>}
        content={unavailable
          ? unavailableContent()
          : <div className={"go-axes"}>
            {GO_BUTTON_AXES.map(axes => {
              const destination = coordinateFromAxes(target, current, axes);
              return <button key={axes}
                className={`${axes.toLowerCase()} fb-button gray`}
                title={goText(axes)}
                onMouseEnter={() => dispatch(chooseLocationAction(destination))}
                onMouseLeave={() => dispatch(unChooseLocationAction())}
                onClick={() => {
                  if (this.state.setAsDefault) {
                    dispatch(setWebAppConfigValue(
                      StringSetting.go_button_axes, axes));
                    this.setState({ setAsDefault: false });
                  }
                  dispatch(setMovementStateFromPosition(current, destination));
                  move(destination);
                  this.setState({ open: false });
                }}>
                {goText(axes)}
              </button>;
            })}
            <div className={"save-as-default-wrapper"}>
              <p>{t("Save as default")}</p>
              <input type={"checkbox"}
                title={t("save as default")}
                onChange={this.toggle("setAsDefault")}
                checked={this.state.setAsDefault} />
            </div>
            <Link to={Path.location(target)}>
              {t("More options")}
              <i className={"fa fa-external-link"} />
            </Link>
          </div>} />
    </div>;
  }
}

export const validGoButtonAxes = (getConfigValue: GetWebAppConfigValue) =>
  "" + (getConfigValue(StringSetting.go_button_axes) || "XY");

const coordinateFromAxes =
  (target: Vector3, current: BotPosition, axes: string) => ({
    x: axes.includes("X") ? target.x : (current.x || 0),
    y: axes.includes("Y") ? target.y : (current.y || 0),
    z: axes.includes("Z") ? target.z : (current.z || 0),
  });

export const chooseLocationAction = (target: BotPosition) => ({
  type: Actions.CHOOSE_LOCATION,
  payload: target,
});

export const unChooseLocationAction = () => ({
  type: Actions.CHOOSE_LOCATION,
  payload: { x: undefined, y: undefined, z: undefined },
});

export const movementPercentRemaining =
  (botPosition: BotPosition, movementState: MovementState) => {
    const { start, distance } = movementState;
    const absDistanceArray: number[] = [];
    const all = ["x", "y", "z"].map((axis: Xyz) => {
      const axisPosition = botPosition[axis];
      const axisStart = start[axis];
      if (!isNumber(axisPosition) || !isNumber(axisStart) || distance[axis] == 0) {
        return 0;
      }
      const absDistance = Math.abs(distance[axis]);
      absDistanceArray.push(absDistance);
      const progress = (axisPosition - axisStart) / distance[axis];
      return Math.max(Math.min(progress * absDistance, absDistance), 0);
    });
    return sum(all) / sum(absDistanceArray) * 100;
  };
