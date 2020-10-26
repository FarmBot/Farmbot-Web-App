import { Vector3, Xyz, AxisOverwrite, AxisAddition } from "farmbot";
import {
  findPointerByTypeAndId, findSlotByToolId,
} from "../../../resources/selectors";
import { maybeFindVariable } from "../../../resources/sequence_meta";
import {
  AxisSelection, ComputeCoordinateProps, ComputeOverwriteProps,
  FetchSpecialValueProps, ComputeAddProps,
} from "./interfaces";
import { isUndefined } from "lodash";
import { validFbosConfig } from "../../../util";
import { getFbosConfig } from "../../../resources/getters";

/** Doesn't support lua. Max variance is used. */
export const computeCoordinate = (props: ComputeCoordinateProps): Vector3 => {
  const { botPosition } = props;
  const coordinate = {
    x: botPosition.x || 0,
    y: botPosition.y || 0,
    z: botPosition.z || 0,
  };
  ["x", "y", "z"].map((axis: Xyz) => {
    (props.step.body || [])
      .filter((item: AxisOverwrite | AxisAddition) => item.args.axis == axis)
      .map(item => {
        switch (item.kind) {
          case "axis_overwrite":
            const overwriteValue = overwrite({
              axis,
              operand: item.args.axis_operand,
              botPosition,
              resourceIndex: props.resourceIndex,
              sequenceUuid: props.sequenceUuid,
            });
            if (!isUndefined(overwriteValue)) {
              coordinate[axis] = overwriteValue;
            }
            break;
          case "axis_addition":
            const addValue = add({ axis, operand: item.args.axis_operand });
            coordinate[axis] = coordinate[axis] + addValue;
            break;
        }
      });
  });
  return coordinate;
};

const overwrite = (props: ComputeOverwriteProps): number | undefined => {
  const resources = props.resourceIndex;
  switch (props.operand.kind) {
    case "point":
      const { pointer_type, pointer_id } = props.operand.args;
      const point = findPointerByTypeAndId(resources, pointer_type, pointer_id);
      return point.body[props.axis];
    case "tool":
      const { tool_id } = props.operand.args;
      const toolSlot = findSlotByToolId(resources, tool_id);
      return toolSlot?.body[props.axis];
    case "identifier":
      const { label } = props.operand.args;
      const variable = maybeFindVariable(label, resources, props.sequenceUuid);
      return variable?.vector?.[props.axis] || 0;
    case "special_value":
      return fetchSpecialValue({
        axis: props.axis,
        label: props.operand.args.label,
        botPosition: props.botPosition,
        resources: resources,
      });
    case "numeric":
      return props.operand.args.number;
  }
};

const fetchSpecialValue = (props: FetchSpecialValueProps): number | undefined => {
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources));
  switch (props.label) {
    case AxisSelection.disable:
      return props.botPosition[props.axis] || 0;
    case AxisSelection.safe_height:
      return fbosConfig?.safe_height || 0;
    case AxisSelection.soil_height:
      return fbosConfig?.soil_height || 0;
  }
};

const add = (props: ComputeAddProps): number => {
  switch (props.operand.kind) {
    case "numeric":
      return props.operand.args.number;
    case "random":
      return props.operand.args.variance;
  }
  return 0;
};
