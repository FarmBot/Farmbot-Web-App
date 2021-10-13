import React from "react";
import { StepWrapper } from "../../step_ui";
import { Row, Col, ExpandableHeader } from "../../../ui";
import { ToolTips } from "../../../constants";
import { t } from "../../../i18next_wrapper";
import { Move, Xyz } from "farmbot";
import { editStep } from "../../../api/crud";
import { some } from "lodash";
import { MoveAbsoluteWarning } from "../tile_move_absolute_conflict_check";
import {
  ComputedMoveState, CommitMoveField, AxisSelection,
  LocationNode, LocSelection, SetAxisState,
} from "./interfaces";
import { computeCoordinate } from "./compute";
import {
  LocationSelection, getLocationState, setSelectionFromLocation,
  setOverwriteFromLocation, setOffsetFromLocation,
} from "./location";
import {
  getOverwriteState, getOverwriteNode, setOverwrite, overwriteAxis,
  OverwriteInputRow,
} from "./overwrite";
import {
  getOffsetState, getVarianceState, getOffsetNode, getVarianceNode,
  axisAddition, VarianceInputRow, OffsetInputRow,
} from "./addition";
import {
  getSpeedState, getSpeedNode, speedOverwrite, SpeedInputRow,
} from "./speed";
import { SafeZCheckbox, getSafeZState, SAFE_Z } from "./safe_z";
import { StepParams } from "../../interfaces";

/**
 * _Computed move_
 *
 * The base command:
 *
 * ```
 * { kind: "move", args: {}, body: []}
 * ```
 *
 * results in an absolute movement to the current bot position at 100% speed:
 *
 * ```
 * G00 X{x} Y{y} Z{z} A{max_spd_x} B{max_spd_y} C{max_spd_z}
 * ```
 *
 * **AxisOverwrite:**
 *
 * The resultant value of the last `body` `axis_overwrite` for a given axis
 * (if one exists) is used as the value for that axis instead of the current
 * bot position. In this component, point or identifier `axis_overwrite`
 * values are chosen using the Location field and can be overwritten with
 * a specific value using the Overwrite field. If a location is chosen and
 * an axis is disabled, the body will not include an `axis_overwrite` for
 * that axis.
 *
 * _operands supported by this component:
 * `Point | Tool | Identifier | SpecialValue | Numeric | Lua`_
 *
 * **AxisAddition:**
 *
 * In this component, only one specific `axis_addition` value (offset) and
 * one random `axis_addition` value (variance) can be chosen for each axis.
 *
 * _operands supported by this component: `Numeric | Lua | Random`_
 *
 */
export class ComputedMove
  extends React.Component<StepParams<Move>, ComputedMoveState> {
  state: ComputedMoveState = {
    locationSelection: getLocationState(this.step).locationSelection,
    location: getLocationState(this.step).location,
    more: !!this.props.expandStepOptions,
    selection: {
      x: getOverwriteState(this.step, "x").selection,
      y: getOverwriteState(this.step, "y").selection,
      z: getOverwriteState(this.step, "z").selection,
    },
    overwrite: {
      x: getOverwriteState(this.step, "x").overwrite,
      y: getOverwriteState(this.step, "y").overwrite,
      z: getOverwriteState(this.step, "z").overwrite,
    },
    offset: {
      x: getOffsetState(this.step, "x"),
      y: getOffsetState(this.step, "y"),
      z: getOffsetState(this.step, "z"),
    },
    variance: {
      x: getVarianceState(this.step, "x"),
      y: getVarianceState(this.step, "y"),
      z: getVarianceState(this.step, "z"),
    },
    speed: {
      x: getSpeedState(this.step, "x"),
      y: getSpeedState(this.step, "y"),
      z: getSpeedState(this.step, "z"),
    },
    safeZ: getSafeZState(this.step),
  };

  get step() { return this.props.currentStep; }

  get disabledAxes() {
    return {
      x: this.state.selection.x == AxisSelection.disable,
      y: this.state.selection.y == AxisSelection.disable,
      z: this.state.selection.z == AxisSelection.disable,
    };
  }

  get overwriteNodes() {
    const getNode = (axis: Xyz) => getOverwriteNode(
      this.state.overwrite[axis],
      this.state.selection[axis],
      this.disabledAxes[axis],
    );
    return {
      x: getNode("x"),
      y: getNode("y"),
      z: getNode("z"),
    };
  }

  get offsetNodes() {
    const getNode = (axis: Xyz) => getOffsetNode(
      this.state.offset[axis],
      this.disabledAxes[axis],
    );
    return {
      x: getNode("x"),
      y: getNode("y"),
      z: getNode("z"),
    };
  }

  get varianceNodes() {
    const getNode = (axis: Xyz) => getVarianceNode(
      this.state.variance[axis],
      this.disabledAxes[axis],
    );
    return {
      x: getNode("x"),
      y: getNode("y"),
      z: getNode("z"),
    };
  }

  get speedNodes() {
    const getNode = (axis: Xyz) => getSpeedNode(
      this.state.speed[axis],
      this.disabledAxes[axis],
    );
    return {
      x: getNode("x"),
      y: getNode("y"),
      z: getNode("z"),
    };
  }

  executor = (s: Move) => {
    const disabled = this.disabledAxes;
    s.body = [
      ...overwriteAxis("x", disabled.x ? undefined : this.state.location),
      ...overwriteAxis("y", disabled.y ? undefined : this.state.location),
      ...overwriteAxis("z", disabled.z ? undefined : this.state.location),
      ...overwriteAxis("x", this.overwriteNodes.x),
      ...overwriteAxis("y", this.overwriteNodes.y),
      ...overwriteAxis("z", this.overwriteNodes.z),
      ...axisAddition("x", this.offsetNodes.x),
      ...axisAddition("y", this.offsetNodes.y),
      ...axisAddition("z", this.offsetNodes.z),
      ...axisAddition("x", this.varianceNodes.x),
      ...axisAddition("y", this.varianceNodes.y),
      ...axisAddition("z", this.varianceNodes.z),
      ...speedOverwrite("x", this.speedNodes.x),
      ...speedOverwrite("y", this.speedNodes.y),
      ...speedOverwrite("z", this.speedNodes.z),
      ...(this.state.safeZ ? [SAFE_Z] : []),
    ];
  };

  editStep = (executor: (s: Move) => void) =>
    this.props.dispatch(editStep({
      step: this.step,
      index: this.props.index,
      sequence: this.props.currentSequence,
      executor,
    }));

  update = () => this.editStep(this.executor);

  commit: CommitMoveField = (field, axis) => event => {
    this.setState({
      ...this.state,
      [field]: {
        ...this.state[field],
        [axis]: typeof this.state[field][axis] == "string"
          ? event.currentTarget.value
          : parseInt(event.currentTarget.value)
      }
    }, this.update);
  };

  setLocationState =
    ({ locationNode, locationSelection }: {
      locationNode: LocationNode,
      locationSelection: LocSelection | undefined,
    }) => {
      const { selection, overwrite, offset } = this.state;
      this.setState({
        locationSelection,
        location: locationNode,
        selection: setSelectionFromLocation(locationSelection, selection),
        overwrite: setOverwriteFromLocation(locationSelection, overwrite),
        offset: setOffsetFromLocation(locationSelection, offset),
      }, this.update);
    };

  setAxisOverwriteState = (axis: Xyz, value: AxisSelection) =>
    this.setState({
      ...this.state,
      selection: {
        ...this.state.selection,
        [axis]: value,
      },
      overwrite: {
        ...this.state.overwrite,
        [axis]: setOverwrite(value),
      },
    }, this.update);

  setAxisState: SetAxisState = (field, axis, defaultValue) =>
    value =>
      this.setState({
        ...this.state,
        [field]: {
          ...this.state[field],
          [axis]: value ?? defaultValue,
        }
      }, this.update);

  toggleSafeZ = () => this.setState({ safeZ: !this.state.safeZ }, this.update);
  toggleMore = () => this.setState({ more: !this.state.more });

  LocationInputRow = () =>
    <Row>
      <Col xs={3}>
        <label>{t("Location")}</label>
      </Col>
      <Col xs={8}>
        <LocationSelection
          locationNode={this.state.location}
          locationSelection={this.state.locationSelection}
          resources={this.props.resources}
          onChange={this.setLocationState}
          sequence={this.props.currentSequence}
          sequenceUuid={this.props.currentSequence.uuid} />
      </Col>
      <Col xs={1} className={"no-pad"}>
        <ExpandableHeader
          expanded={this.state.more}
          title={""}
          onClick={this.toggleMore} />
      </Col>
    </Row>;

  OverwriteInputRow = () =>
    (this.state.locationSelection == "custom"
      || some(this.overwriteNodes)
      || this.state.more)
      ? <OverwriteInputRow
        selection={this.state.selection}
        overwrite={this.state.overwrite}
        locationSelection={this.state.locationSelection}
        disabledAxes={this.disabledAxes}
        onCommit={this.commit}
        setAxisState={this.setAxisState}
        setAxisOverwriteState={this.setAxisOverwriteState} />
      : <div className={"overwrite-row-hidden"} />;

  OffsetInputRow = () =>
    (this.state.locationSelection == "offset"
      || some(this.offsetNodes)
      || this.state.more)
      ? <OffsetInputRow
        offset={this.state.offset}
        disabledAxes={this.disabledAxes}
        onCommit={this.commit}
        setAxisState={this.setAxisState} />
      : <div className={"offset-row-hidden"} />;

  VarianceInputRow = () =>
    (some(this.varianceNodes) || this.state.more)
      ? <VarianceInputRow
        variance={this.state.variance}
        disabledAxes={this.disabledAxes}
        onCommit={this.commit} />
      : <div className={"variance-row-hidden"} />;

  SpeedInputRow = () =>
    (some(this.speedNodes) || this.state.more)
      ? <SpeedInputRow
        speed={this.state.speed}
        disabledAxes={this.disabledAxes}
        onCommit={this.commit}
        setAxisState={this.setAxisState} />
      : <div className={"speed-row-hidden"} />;

  SafeZCheckbox = () =>
    (this.state.safeZ || this.state.more)
      ? <SafeZCheckbox checked={this.state.safeZ}
        onChange={this.toggleSafeZ} />
      : <div className={"safe-z-checkbox-hidden"} />;

  render() {
    return <StepWrapper {...this.props}
      className={"computed-move-step"}
      helpText={ToolTips.COMPUTED_MOVE}
      warning={<MoveAbsoluteWarning
        coordinate={computeCoordinate({
          step: this.step,
          botPosition: { x: undefined, y: undefined, z: undefined },
          resourceIndex: this.props.resources,
          sequenceUuid: this.props.currentSequence.uuid,
        })}
        hardwareFlags={this.props.hardwareFlags} />}>
      <this.LocationInputRow />
      <this.OverwriteInputRow />
      <this.OffsetInputRow />
      <this.VarianceInputRow />
      <this.SpeedInputRow />
      <this.SafeZCheckbox />
    </StepWrapper>;
  }
}
