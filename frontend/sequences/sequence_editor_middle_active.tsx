import * as React from "react";
import { ActiveMiddleProps, SequenceHeaderProps } from "./interfaces";
import { editCurrentSequence } from "./actions";
import { splice, move } from "./step_tiles";

import { push } from "../history";
import { BlurableInput, Row, Col, SaveBtn, ColorPicker } from "../ui";
import { DropArea } from "../draggable/drop_area";
import { stepGet } from "../draggable/actions";
import { copySequence } from "./actions";
import { TaggedSequence, SyncStatus } from "farmbot";
import { save, edit, destroy } from "../api/crud";
import { TestButton } from "./test_button";
import { AllSteps } from "./all_steps";
import { LocalsList, localListCallback } from "./locals_list/locals_list";
import { betterCompact } from "../util";
import { AllowedVariableNodes } from "./locals_list/locals_list_support";
import { ResourceIndex } from "../resources/interfaces";
import { ShouldDisplay } from "../devices/interfaces";
import { isScopeDeclarationBodyItem } from "./locals_list/handle_select";
import { t } from "../i18next_wrapper";

export const onDrop =
  (dispatch1: Function, sequence: TaggedSequence) =>
    (index: number, key: string) => {
      if (key.length > 0) {
        dispatch1(function (dispatch2: Function) {
          const dataXferObj = dispatch2(stepGet(key));
          const step = dataXferObj.value;
          switch (dataXferObj.intent) {
            case "step_splice":
              return dispatch2(splice({ step, sequence, index }));
            case "step_move":
              const action =
                move({ step, sequence, to: index, from: dataXferObj.draggerId });
              return dispatch2(action);
            default:
              throw new Error("Got unexpected data transfer object.");
          }
        });
      }
    };

interface SequenceBtnGroupProps {
  dispatch: Function;
  sequence: TaggedSequence;
  syncStatus: SyncStatus;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
  menuOpen: boolean;
}

const SequenceBtnGroup = ({
  dispatch, sequence, syncStatus, resources, shouldDisplay, menuOpen
}: SequenceBtnGroupProps) =>
  <div className="button-group">
    <SaveBtn status={sequence.specialStatus}
      onClick={() => dispatch(save(sequence.uuid))} />
    <TestButton
      syncStatus={syncStatus}
      sequence={sequence}
      resources={resources}
      shouldDisplay={shouldDisplay}
      menuOpen={menuOpen}
      dispatch={dispatch} />
    <button
      className="fb-button red"
      onClick={() => {
        dispatch(destroy(sequence.uuid)).then(
          () => push("/app/sequences/"));
      }}>
      {t("Delete")}
    </button>
    <button
      className="fb-button yellow"
      onClick={() => dispatch(copySequence(sequence))}>
      {t("Copy")}
    </button>
  </div>;

export const SequenceNameAndColor = ({ dispatch, sequence }: {
  dispatch: Function, sequence: TaggedSequence
}) =>
  <Row>
    <Col xs={11}>
      <BlurableInput value={sequence.body.name}
        placeholder={t("Sequence Name")}
        onCommit={e =>
          dispatch(edit(sequence, { name: e.currentTarget.value }))} />
    </Col>
    <Col xs={1} className="color-picker-col">
      <ColorPicker
        current={sequence.body.color}
        onChange={color =>
          editCurrentSequence(dispatch, sequence, { color })} />
    </Col>
  </Row>;

const SequenceHeader = (props: SequenceHeaderProps) => {
  const { sequence, dispatch } = props;
  const sequenceAndDispatch = { sequence, dispatch };
  const variableData = props.resources.sequenceMetas[sequence.uuid] || {};
  const declarations = betterCompact(Object.values(variableData)
    .map(v => v &&
      isScopeDeclarationBodyItem(v.celeryNode) ? v.celeryNode : undefined));
  return <div id="sequence-editor-tools" className="sequence-editor-tools">
    <SequenceBtnGroup {...sequenceAndDispatch}
      syncStatus={props.syncStatus}
      resources={props.resources}
      shouldDisplay={props.shouldDisplay}
      menuOpen={props.menuOpen} />
    <SequenceNameAndColor {...sequenceAndDispatch} />
    <LocalsList
      variableData={variableData}
      sequenceUuid={sequence.uuid}
      resources={props.resources}
      onChange={localListCallback(props)(declarations)}
      locationDropdownKey={JSON.stringify(sequence)}
      allowedVariableNodes={AllowedVariableNodes.parameter}
      collapsible={true}
      collapsed={props.variablesCollapsed}
      toggleVarShow={props.toggleVarShow}
      shouldDisplay={props.shouldDisplay} />
  </div>;
};

interface ActiveMiddleState {
  variablesCollapsed: boolean;
}

export class SequenceEditorMiddleActive extends
  React.Component<ActiveMiddleProps, ActiveMiddleState> {
  state: ActiveMiddleState = { variablesCollapsed: false };

  /** Make room for the sequence header variable form when necessary. */
  get stepSectionHeight() {
    const { resources, sequence } = this.props;
    let subHeight = 200;
    const variables =
      Object.keys(resources.sequenceMetas[sequence.uuid] || {}).length > 0;
    if (variables) { subHeight = 500; }
    if (this.state.variablesCollapsed) { subHeight = 300; }
    const variablesDiv = document.getElementById("sequence-editor-tools");
    if (variablesDiv) { subHeight = 200 + variablesDiv.offsetHeight; }
    return `calc(100vh - ${subHeight}px)`;
  }

  render() {
    const { dispatch, sequence } = this.props;
    return <div className="sequence-editor-content">
      <SequenceHeader
        dispatch={this.props.dispatch}
        sequence={sequence}
        resources={this.props.resources}
        syncStatus={this.props.syncStatus}
        shouldDisplay={this.props.shouldDisplay}
        variablesCollapsed={this.state.variablesCollapsed}
        toggleVarShow={() =>
          this.setState({ variablesCollapsed: !this.state.variablesCollapsed })}
        menuOpen={this.props.menuOpen} />
      <hr />
      <div className="sequence" id="sequenceDiv"
        style={{ height: this.stepSectionHeight }}>
        <AllSteps onDrop={onDrop(dispatch, sequence)} {...this.props} />
        <Row>
          <Col xs={12}>
            <DropArea isLocked={true}
              callback={key => onDrop(dispatch, sequence)(Infinity, key)}>
              {t("DRAG COMMAND HERE")}
            </DropArea>
          </Col>
        </Row>
      </div>
    </div>;
  }
}
