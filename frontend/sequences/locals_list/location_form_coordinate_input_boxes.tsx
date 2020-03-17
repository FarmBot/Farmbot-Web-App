import * as React from "react";
import { Row, Col, BlurableInput } from "../../ui";
import { VariableNode } from "../locals_list/locals_list_support";
import { defensiveClone } from "../../util/util";
import { Xyz, Vector3 } from "farmbot";
import { determineEditable } from "../../resources/sequence_meta";
import { t } from "../../i18next_wrapper";

export interface AxisEditProps {
  axis: Xyz;
  onChange: (sd: VariableNode) => void;
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
      !isNaN(num) && onChange(editableVariable);
    }
  };

/** For LocationForm coordinate input boxes.  */
interface CoordinateInputBoxesProps {
  vector: Vector3 | undefined;
  variableNode: VariableNode;
  width: number | undefined;
  onChange: (sd: VariableNode | undefined) => void;
}

/** LocationForm coordinate input boxes.  */
export const CoordinateInputBoxes = (props: CoordinateInputBoxesProps) => {
  const { variableNode, vector, onChange } = props;
  /** Show coordinate input boxes if editable (not using external data). */
  const visible = determineEditable(variableNode);
  const editableVariable = defensiveClone(variableNode);
  return (vector && visible)
    ? <Row>
      {["x", "y", "z"].map((axis: Xyz) =>
        <Col xs={props.width || 4} key={axis}>
          <label>
            {t("{{axis}} (mm)", { axis })}
          </label>
          <BlurableInput type="number"
            onCommit={manuallyEditAxis({ axis, onChange, editableVariable })}
            name={`location-${axis}`}
            value={"" + vector[axis]} />
        </Col>)}
    </Row>
    : <div className={"no-location-coordinate-input-boxes"} />;
};
