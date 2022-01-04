import React from "react";
import { Row, Col, BlurableInput } from "../../ui";
import { OnChange, VariableNode } from "../locals_list/locals_list_support";
import { defensiveClone } from "../../util/util";
import { Xyz, Vector3 } from "farmbot";
import { determineEditable } from "../../resources/sequence_meta";

export interface AxisEditProps {
  axis: Xyz;
  onChange: OnChange;
  editableVariable: VariableNode;
}

/** Update a variable coordinate. */
export const manuallyEditAxis = (props: AxisEditProps) =>
  (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { axis, onChange, editableVariable } = props;
    const num = parseFloat(e.currentTarget.value);
    if (editableVariable.kind !== "parameter_declaration" &&
      editableVariable.args.data_value.kind === "coordinate") {
      editableVariable.args.data_value.args[axis] = num;
      !isNaN(num) && onChange(editableVariable, editableVariable.args.label);
    }
  };

/** For VariableForm coordinate input boxes.  */
interface CoordinateInputBoxesProps {
  vector: Vector3 | undefined;
  variableNode: VariableNode;
  onChange: OnChange;
  hideWrapper: boolean;
  narrowLabel: boolean;
}

/** VariableForm coordinate input boxes.  */
export const CoordinateInputBoxes = (props: CoordinateInputBoxesProps) => {
  const { variableNode, vector, onChange } = props;
  /** Show coordinate input boxes if editable (not using external data). */
  const visible = determineEditable(variableNode);
  const editableVariable = defensiveClone(variableNode);
  return (vector && visible)
    ? <Row className={"custom-coordinate-form"}>
      {!props.hideWrapper && <Col xs={props.narrowLabel ? 5 : 6} />}
      {["x", "y", "z"].map((axis: Xyz) =>
        <Col xs={props.hideWrapper ? 3 : 2} className={`${axis} no-pad`} key={axis}>
          <BlurableInput type="number"
            onCommit={manuallyEditAxis({ axis, onChange, editableVariable })}
            name={`location-${axis}`}
            value={"" + vector[axis]} />
        </Col>)}
    </Row>
    : <div className={"no-location-coordinate-input-boxes"} />;
};
