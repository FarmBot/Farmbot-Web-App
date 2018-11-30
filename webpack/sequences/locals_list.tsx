import * as React from "react";
import { Row, Col, FBSelect } from "../ui";
import { t } from "i18next";
import {
  generateList
} from "./step_tiles/tile_move_absolute/generate_list";
import { InputBox } from "./step_tiles/tile_move_absolute/input_box";
import { convertDDItoScopeDeclr } from "./step_tiles/tile_move_absolute/handle_select";
import { ParentVariableFormProps, LocalsListProps, PARENT } from "./locals_list_support";
import { editCurrentSequence } from "./actions";

const REWRITE_THIS = () => {
  console.error("Re write this callback, OK? RC");
};

/** When sequence.args.locals actually has variables, render this form.
 * Allows the user to chose the value of the `parent` variable, etc. */
export const ParentVariableForm =
  (props: ParentVariableFormProps) => {
    const { sequence, resources, onChange } = props;
    const { x, y, z } = props.parent.location;
    const isDisabled = !props.parent.editable;
    const list = generateList(resources, [PARENT]);
    return <div className="parent-variable-form">
      <Row>
        <Col xs={12}>
          <h5>{t("Import Coordinates From")}</h5>
          <FBSelect
            key={JSON.stringify(sequence)}
            allowEmpty={true}
            list={list}
            selectedItem={props.parent.dropdown}
            onChange={(ddi) => onChange(convertDDItoScopeDeclr(props.resources, ddi))} />
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <InputBox
            onCommit={REWRITE_THIS}
            disabled={isDisabled}
            name="location-x-variabledeclr"
            value={"" + x}>
            {t("X (mm)")}
          </InputBox>
        </Col>
        <Col xs={4}>
          <InputBox
            onCommit={REWRITE_THIS}
            disabled={isDisabled}
            name="location-y-variabledeclr"
            value={"" + y}>
            {t("Y (mm)")}
          </InputBox>
        </Col>
        <Col xs={4}>
          <InputBox
            onCommit={REWRITE_THIS}
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
  const parent = props.variableData["parent"];
  return parent
    ? <ParentVariableForm
      parent={parent}
      sequence={props.deprecatedSequence}
      resources={props.deprecatedResources}
      onChange={(locals) => {
        const oldArgs = props.deprecatedSequence.body.args;
        const args: typeof props.deprecatedSequence.body.args =
          ({ ...oldArgs, locals });
        editCurrentSequence(props.dispatch, props.deprecatedSequence, { args });
      }} />
    : <div />;
};
