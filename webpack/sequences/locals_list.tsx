import * as React from "react";
import {
  ParentVariableFormProps,
  PARENT,
  LocalsListProps
} from "./locals_list_support";
import { Row, Col, FBSelect } from "../ui";
import { t } from "i18next";
import {
  generateList
} from "./step_tiles/tile_move_absolute/generate_list";
import { InputBox } from "./step_tiles/tile_move_absolute/input_box";

const REWRITE_THIS = () => {
  console.error("Re write this callback, OK? RC");
};

/** When sequence.args.locals actually has variables, render this form.
 * Allows the user to chose the value of the `parent` variable, etc. */
export const ParentVariableForm =
  (props: ParentVariableFormProps) => {
    const { sequence, resources } = props;
    const { x, y, z } = props.betterParent.location;
    const isDisabled = !props.betterParent.editable;

    return <div className="parent-variable-form">
      <Row>
        <Col xs={12}>
          <h5>{t("Import Coordinates From")}</h5>
          <FBSelect
            key={JSON.stringify(sequence)}
            allowEmpty={true}
            list={generateList(resources, [PARENT])}
            selectedItem={props.betterParent.dropdown}
            onChange={(x) => {
              console.log("REIMPLEMENT ME:");
              console.dir(x);
              } />
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
  const betterParent = props.variableData["parent"];
  return betterParent
    ? <ParentVariableForm
      betterParent={betterParent}
      deprecatedParent={betterParent.celeryNode}
      sequence={props.deprecatedSequence}
      resources={props.deprecatedResources}
      onChange={REWRITE_THIS} />
    : <div />;
};
