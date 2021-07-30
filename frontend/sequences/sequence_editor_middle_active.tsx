import React from "react";
import { t } from "../i18next_wrapper";
import {
  ActiveMiddleProps, SequenceHeaderProps, SequenceBtnGroupProps,
  SequenceSettingProps, SequenceSettingsMenuProps, ActiveMiddleState,
} from "./interfaces";
import { editCurrentSequence, copySequence, pinSequenceToggle } from "./actions";
import { splice, move, stringifySequenceData } from "./step_tiles";
import { push } from "../history";
import {
  BlurableInput, Row, Col, SaveBtn, ColorPicker, Help, ToggleButton,
} from "../ui";
import { DropArea } from "../draggable/drop_area";
import { stepGet } from "../draggable/actions";
import { TaggedSequence } from "farmbot";
import { save, edit, destroy } from "../api/crud";
import { TestButton } from "./test_button";
import { AllSteps } from "./all_steps";
import {
  LocalsList, localListCallback, removeVariable,
} from "./locals_list/locals_list";
import { betterCompact, urlFriendly } from "../util";
import { AllowedVariableNodes } from "./locals_list/locals_list_support";
import { isScopeDeclarationBodyItem } from "./locals_list/handle_select";
import { Content, Actions, DeviceSetting } from "../constants";
import { Popover, Position } from "@blueprintjs/core";
import { setWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { isUndefined } from "lodash";
import { ErrorBoundary } from "../error_boundary";
import { sequencesUrlBase, inDesigner } from "../folders/component";
import { visualizeInMap } from "../farm_designer/map/sequence_visualization";
import { getModifiedClassName } from "../settings/default_values";

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

export const SequenceSetting = (props: SequenceSettingProps) => {
  const raw_value = props.getWebAppConfigValue(props.setting);
  const value = (props.defaultOn && isUndefined(raw_value)) ? true : !!raw_value;
  const proceed = () =>
    (props.confirmation && !value) ? confirm(t(props.confirmation)) : true;
  return <fieldset>
    <label>
      {t(props.label)}
    </label>
    <Help text={t(props.description)} />
    <ToggleButton
      className={getModifiedClassName(props.setting)}
      toggleValue={value}
      toggleAction={() => proceed() &&
        props.dispatch(setWebAppConfigValue(props.setting, !value))} />
  </fieldset>;
};

export const SequenceSettingsMenu =
  (props: SequenceSettingsMenuProps) => {
    const { dispatch, getWebAppConfigValue } = props;
    const commonProps = { dispatch, getWebAppConfigValue };
    return <div className="sequence-settings-menu">
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.confirm_step_deletion}
        label={DeviceSetting.confirmStepDeletion}
        description={Content.CONFIRM_STEP_DELETION} />
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.confirm_sequence_deletion}
        defaultOn={true}
        label={DeviceSetting.confirmSequenceDeletion}
        description={Content.CONFIRM_SEQUENCE_DELETION} />
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.show_pins}
        label={DeviceSetting.showPins}
        description={Content.SHOW_PINS} />
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.expand_step_options}
        label={DeviceSetting.openOptionsByDefault}
        description={Content.EXPAND_STEP_OPTIONS} />
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.discard_unsaved_sequences}
        confirmation={Content.DISCARD_UNSAVED_SEQUENCE_CHANGES_CONFIRM}
        label={DeviceSetting.discardUnsavedSequenceChanges}
        description={Content.DISCARD_UNSAVED_SEQUENCE_CHANGES} />
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.view_celery_script}
        label={DeviceSetting.viewCeleryScript}
        description={Content.VIEW_CELERY_SCRIPT} />
    </div>;
  };

const SequenceBtnGroup = ({
  dispatch,
  sequence,
  syncStatus,
  resources,
  menuOpen,
  getWebAppConfigValue,
  toggleViewSequenceCeleryScript,
  visualized,
}: SequenceBtnGroupProps) =>
  <div className="button-group">
    <SaveBtn status={sequence.specialStatus}
      onClick={() => dispatch(save(sequence.uuid)).then(() =>
        push(sequencesUrlBase() + urlFriendly(sequence.body.name)))} />
    <TestButton
      syncStatus={syncStatus}
      sequence={sequence}
      resources={resources}
      menuOpen={menuOpen}
      dispatch={dispatch} />
    <button
      className="fb-button red"
      title={t("delete sequence")}
      onClick={() => {
        const confirm = getWebAppConfigValue(
          BooleanSetting.confirm_sequence_deletion);
        const force = !(confirm ?? true);
        dispatch(destroy(sequence.uuid, force))
          .then(() => push(sequencesUrlBase()));
      }}>
      <i className={"fa fa-trash"} />
    </button>
    <button
      className="fb-button yellow"
      title={t("copy sequence")}
      onClick={() => dispatch(copySequence(sequence))}>
      <i className={"fa fa-copy"} />
    </button>
    {inDesigner() &&
      <button
        className={`fb-button ${visualized ? "gray" : "orange"}`}
        title={t("toggle map visualization")}
        onClick={() =>
          dispatch(visualizeInMap(visualized ? undefined : sequence.uuid))}>
        {visualized ? t("unvisualize") : t("visualize")}
      </button>}
    <div className={"settings-menu-button"}>
      <Popover position={Position.BOTTOM_RIGHT}>
        <i className="fa fa-gear" />
        <SequenceSettingsMenu
          dispatch={dispatch}
          getWebAppConfigValue={getWebAppConfigValue} />
      </Popover>
    </div>
    {getWebAppConfigValue(BooleanSetting.view_celery_script) &&
      <i className="fa fa-code step-control"
        onClick={toggleViewSequenceCeleryScript} />}
  </div>;

export const SequenceNameAndColor = ({ dispatch, sequence }: {
  dispatch: Function, sequence: TaggedSequence
}) =>
  <Row>
    <Col xs={10}>
      <BlurableInput value={sequence.body.name}
        placeholder={t("Sequence Name")}
        onCommit={e =>
          dispatch(edit(sequence, { name: e.currentTarget.value }))} />
    </Col>
    <Col xs={1} className="pinned-col">
      <i title={sequence.body.pinned ? t("unpin sequence") : t("pin sequence")}
        className={[
          "fa",
          "fa-thumb-tack",
          sequence.body.pinned ? "pinned" : "",
        ].join(" ")}
        onClick={() => dispatch(pinSequenceToggle(sequence))} />
    </Col>
    <Col xs={1} className="color-picker-col">
      <ColorPicker
        current={sequence.body.color}
        onChange={color =>
          editCurrentSequence(dispatch, sequence, { color })} />
    </Col>
  </Row>;

export const SequenceHeader = (props: SequenceHeaderProps) => {
  const { sequence, dispatch } = props;
  const sequenceAndDispatch = { sequence, dispatch };
  const variableData = props.resources.sequenceMetas[sequence.uuid] || {};
  const declarations = betterCompact(Object.values(variableData)
    .map(v => v && isScopeDeclarationBodyItem(v.celeryNode)
      ? v.celeryNode
      : undefined));
  return <div id="sequence-editor-tools" className="sequence-editor-tools">
    <SequenceBtnGroup {...sequenceAndDispatch}
      syncStatus={props.syncStatus}
      resources={props.resources}
      getWebAppConfigValue={props.getWebAppConfigValue}
      toggleViewSequenceCeleryScript={props.toggleViewSequenceCeleryScript}
      visualized={props.visualized}
      menuOpen={props.menuOpen} />
    <SequenceNameAndColor {...sequenceAndDispatch} />
    <ErrorBoundary>
      <LocalsList
        variableData={variableData}
        sequenceUuid={sequence.uuid}
        resources={props.resources}
        onChange={localListCallback(props)(declarations)}
        removeVariable={removeVariable(props)}
        locationDropdownKey={JSON.stringify(sequence)}
        allowedVariableNodes={AllowedVariableNodes.parameter}
        collapsible={true}
        collapsed={props.variablesCollapsed}
        toggleVarShow={props.toggleVarShow}
        hideGroups={true} />
    </ErrorBoundary>
  </div>;
};

export class SequenceEditorMiddleActive extends
  React.Component<ActiveMiddleProps, ActiveMiddleState> {
  state: ActiveMiddleState = {
    variablesCollapsed: false,
    viewSequenceCeleryScript: false,
  };

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

  get stepProps() {
    const getConfig = this.props.getWebAppConfigValue;
    return {
      sequence: this.props.sequence,
      onDrop: onDrop(this.props.dispatch, this.props.sequence),
      dispatch: this.props.dispatch,
      resources: this.props.resources,
      hardwareFlags: this.props.hardwareFlags,
      farmwareData: this.props.farmwareData,
      showPins: !!getConfig(BooleanSetting.show_pins),
      expandStepOptions: !!getConfig(BooleanSetting.expand_step_options),
      visualized: this.props.visualized,
      hoveredStep: this.props.hoveredStep,
    };
  }

  render() {
    const { dispatch, sequence } = this.props;
    return <div className="sequence-editor-content">
      <SequenceHeader
        dispatch={this.props.dispatch}
        sequence={sequence}
        resources={this.props.resources}
        syncStatus={this.props.syncStatus}
        variablesCollapsed={this.state.variablesCollapsed}
        toggleVarShow={() =>
          this.setState({ variablesCollapsed: !this.state.variablesCollapsed })}
        toggleViewSequenceCeleryScript={() => this.setState({
          viewSequenceCeleryScript: !this.state.viewSequenceCeleryScript
        })}
        getWebAppConfigValue={this.props.getWebAppConfigValue}
        visualized={this.props.visualized}
        menuOpen={this.props.menuOpen} />
      <hr />
      <div className="sequence" id="sequenceDiv"
        style={{ height: this.stepSectionHeight }}>
        {this.state.viewSequenceCeleryScript
          ? <pre>{stringifySequenceData(this.props.sequence.body)}</pre>
          : <div className={"sequence-step-components"}>
            <ErrorBoundary>
              <AllSteps {...this.stepProps} />
            </ErrorBoundary>
            <Row>
              <Col xs={12}>
                <DropArea isLocked={true}
                  callback={key => onDrop(dispatch, sequence)(Infinity, key)}>
                  {t("DRAG COMMAND HERE")}
                </DropArea>
                <AddCommandButton dispatch={dispatch} index={99999999} />
              </Col>
            </Row>
          </div>}
      </div>
    </div>;
  }
}

export const AddCommandButton = (props: { dispatch: Function, index: number }) =>
  <div className="add-command-button-container">
    <button
      className="add-command fb-button gray"
      title={t("add sequence step")}
      onClick={() => {
        props.dispatch({
          type: Actions.SET_SEQUENCE_STEP_POSITION,
          payload: props.index,
        });
        inDesigner() && push("/app/designer/sequences/commands");
      }}>
      {t("Add command")}
    </button>
  </div>;
