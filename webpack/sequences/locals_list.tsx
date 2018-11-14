import * as React from "react";
import {
  ParentVariableFormProps,
  guessXYZ,
  PARENT,
  changeAxis,
  LocalsListProps,
  extractParent,
  handleVariableChange
} from "./locals_list_support";
import { Row, Col, FBSelect } from "../ui";
import { t } from "i18next";
import {
  generateList
} from "./step_tiles/tile_move_absolute/generate_list";
import {
  formatSelectedDropdown
} from "./step_tiles/tile_move_absolute/format_selected_dropdown";
import {
  EMPTY_COORD,
  handleSelect
} from "./step_tiles/tile_move_absolute/handle_select";
import { InputBox } from "./step_tiles/tile_move_absolute/input_box";

/** When sequence.args.locals actually has variables, render this form.
 * Allows the user to chose the value of the `parent` variable, etc. */
export const ParentVariableForm =
  ({ parent, sequence, resources, onChange }: ParentVariableFormProps) => {
    const data_value = (parent.kind == "variable_declaration") ?
      parent.args.data_value : EMPTY_COORD;
    const ddiLabel = formatSelectedDropdown(resources, data_value);
    const { x, y, z } = guessXYZ(ddiLabel.label, parent, resources);

    const isDisabled = (parent.kind == "parameter_declaration") ||
      data_value.kind !== "coordinate";

    return <div className="parent-variable-form">
      <Row>
        <Col xs={12}>
          <h5>{t("Import Coordinates From")}</h5>
          <FBSelect
            key={JSON.stringify(sequence)}
            allowEmpty={true}
            list={generateList(resources, [PARENT])}
            selectedItem={ddiLabel}
            onChange={ddi => onChange(handleSelect(resources, ddi))} />
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <InputBox
            onCommit={changeAxis("x", onChange, data_value)}
            disabled={isDisabled}
            name="location-x-variabledeclr"
            value={"" + x}>
            {t("X (mm)")}
          </InputBox>
        </Col>
        <Col xs={4}>
          <InputBox
            onCommit={changeAxis("y", onChange, data_value)}
            disabled={isDisabled}
            name="location-y-variabledeclr"
            value={"" + y}>
            {t("Y (mm)")}
          </InputBox>
        </Col>
        <Col xs={4}>
          <InputBox
            onCommit={changeAxis("z", onChange, data_value)}
            name="location-z-variabledeclr"
            disabled={isDisabled}
            value={"" + z}>
            {t("Z (mm)")}
          </InputBox>
        </Col>
      </Row>
    </div>;
  };

/** List of local variable declarations for a sequence. If no variables are
 * found, shows nothing. */
export const LocalsList = (props: LocalsListProps) => {
  const parent = extractParent(props.sequence.body.args.locals.body);
  return parent
    ? <ParentVariableForm
      parent={parent}
      sequence={props.sequence}
      resources={props.resources}
      onChange={handleVariableChange(props.dispatch, props.sequence)} />
    : <div />;
};
