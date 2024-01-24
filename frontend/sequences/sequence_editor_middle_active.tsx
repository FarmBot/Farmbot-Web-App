import React from "react";
import { t } from "../i18next_wrapper";
import {
  ActiveMiddleProps, SequenceHeaderProps, SequenceBtnGroupProps,
  SequenceSettingProps, SequenceSettingsMenuProps, ActiveMiddleState,
  SequenceShareMenuProps,
  FarmwareData,
} from "./interfaces";
import {
  editCurrentSequence, copySequence, pinSequenceToggle, publishSequence,
  upgradeSequence,
  unpublishSequence,
} from "./actions";
import { splice, move, stringifySequenceData } from "./step_tiles";
import { push } from "../history";
import {
  BlurableInput, Row, Col, SaveBtn, Help, ToggleButton, Popover,
  Markdown,
  FBSelect,
  DropDownItem,
  ColorPickerCluster,
} from "../ui";
import { DropArea } from "../draggable/drop_area";
import { stepGet } from "../draggable/actions";
import {
  ParameterDeclaration, SpecialStatus, TaggedSequence, VariableDeclaration,
} from "farmbot";
import { save, edit, destroy } from "../api/crud";
import { TestButton } from "./test_button";
import { AllSteps, AllStepsProps } from "./all_steps";
import {
  LocalsList, localListCallback, removeVariable, generateNewVariableLabel,
} from "./locals_list/locals_list";
import { betterCompact, urlFriendly } from "../util";
import {
  AllowedVariableNodes, VariableType,
} from "./locals_list/locals_list_support";
import { isScopeDeclarationBodyItem } from "./locals_list/handle_select";
import { Content, Actions, DeviceSetting } from "../constants";
import { Collapse, PopoverInteractionKind, Position } from "@blueprintjs/core";
import {
  GetWebAppConfigValue, setWebAppConfigValue,
} from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { clone, isUndefined, last, sortBy } from "lodash";
import { ErrorBoundary } from "../error_boundary";
import { visualizeInMap } from "../farm_designer/map/sequence_visualization";
import { getModifiedClassName } from "../settings/default_values";
import { error } from "../toast/toast";
import { Link } from "../link";
import { API } from "../api";
import { ExternalUrl } from "../external_urls";
import { InputLengthIndicator } from "./inputs/input_length_indicator";
import {
  License, loadSequenceVersion, SequencePreviewContent,
} from "./panel/preview_support";
import { Path } from "../internal_urls";
import { ResourceIndex, UUID, VariableNameSet } from "../resources/interfaces";
import { newVariableDataValue, newVariableLabel } from "./locals_list/new_variable";
import { StepButtonCluster } from "./step_button_cluster";
import { requestAutoGeneration } from "./request_auto_generation";
import { AutoGenerateButton, ResourceTitle } from "./panel/editor";

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

const MitLicenseLink = () =>
  <a href={ExternalUrl.mitLicense} target={"_blank"} rel={"noreferrer"}>
    {t("MIT License")}
  </a>;

export const publishAction = (setState: (state: boolean) => void) => {
  setState(true);
  setTimeout(() => setState(false), 5000);
};

export const SequencePublishMenu = (props: SequenceShareMenuProps) => {
  const { sequence } = props;
  const disabled = sequence.specialStatus !== SpecialStatus.SAVED;
  const [publishing, setPublishing] = React.useState(false);
  const [copyright, setCopyright] = React.useState(sequence.body.copyright || "");
  return <div className={"sequence-publish-menu"}>
    <div className={"sequence-publish-message"}>
      <p style={{ paddingBottom: 0 }}>
        {t("Publishing this sequence will create a")}
        <b>{` ${t("public version")} `}</b>
        {`${t("released under the")} `}
        <MitLicenseLink />{". "}
        {t(Content.PUBLISH_SEQUENCE_ONCE_PUBLISHED)}
      </p>
      <ul>
        <li>
          {t(Content.PUBLISH_SEQUENCE_MAY_IMPORT)}
        </li>
        <li>
          {t("Upgrading their copy to other published versions")}
        </li>
        <li>
          {t("Making changes to their copy")}
        </li>
        <li>
          {t("Publishing, distributing, and even selling their copy")}
        </li>
      </ul>
      <p>
        {t(Content.PUBLISH_SEQUENCE_NEW_VERSIONS)}
      </p>
      <p style={{ paddingBottom: 0 }}>
        {t(Content.PUBLISH_SEQUENCE_UNPUBLISH)}
      </p>
      <label>{t("copyright holders")}:</label>
      <input defaultValue={copyright}
        onChange={e => setCopyright(e.currentTarget.value)} />
      {isSequenceImportedOrPublished(sequence) &&
        <div className={"republish-warning"}>
          <i className={"fa fa-exclamation-triangle"} />
          <p>{t(Content.REPUBLISH_WARNING)}</p>
        </div>}
    </div>
    <button className={`fb-button gray ${disabled ? "pseudo-disabled" : ""}`}
      onClick={() => {
        if (disabled) {
          error(t("Save sequence first."));
        } else {
          publishSequence(sequence.body.id, copyright)();
          publishAction(setPublishing);
        }
      }}>
      {publishing ? t("publishing") : t("publish")}
      {publishing && <i className={"fa fa-spinner fa-pulse"} />}
    </button>
  </div>;
};

const sequenceVersionList = (versionIds: number[]): DropDownItem[] => {
  return clone(versionIds).reverse().map((id, index) => ({
    label: `V${versionIds.length - index}${index == 0 ? " (latest)" : ""}`,
    value: id,
  }));
};

export const SequenceShareMenu = (props: SequenceShareMenuProps) => {
  const { sequence } = props;
  const disabled = sequence.specialStatus !== SpecialStatus.SAVED;
  const ids = sortBy(sequence.body.sequence_versions);
  const linkPath = Path.sequenceVersion(last(ids));
  const [publishing, setPublishing] = React.useState(false);
  const [unpublishing, setUnpublishing] = React.useState(false);
  return <div className={"sequence-share-menu"}>
    <p>{t("This sequence is published at the following link")}</p>
    <Link to={linkPath}>
      {`${API.current.baseUrl.split("//")[1]}/${linkPath}`.replace("//", "/")}
    </Link>
    <div className={"versions-table"}>
      <label>{t("versions")}</label>
      <Help text={Content.SEQUENCE_VERSIONS} />
      <button className={`fb-button gray ${disabled ? "pseudo-disabled" : ""}`}
        onClick={() => {
          if (disabled) {
            error(t(Content.SAVE_SEQUENCE_BEFORE_PUBLISHING));
          } else {
            publishSequence(sequence.body.id, sequence.body.copyright || "")();
            publishAction(setPublishing);
          }
        }}>
        <i className={`fa ${publishing ? "fa-spinner fa-pulse" : "fa-plus"}`} />
      </button>
      {sequenceVersionList(ids).map(version =>
        <Row key={version.label}>
          <Col xs={6}>
            <p>{version.label}</p>
          </Col>
          <Col xs={6}>
            <Link to={Path.sequenceVersion(version.value)}>
              <i className={"fa fa-link"} />
            </Link>
          </Col>
        </Row>)}
    </div>
    <button className={"fb-button white"}
      onClick={() => {
        unpublishSequence(sequence.body.id)();
        publishAction(setUnpublishing);
      }}>
      {unpublishing ? t("Unpublishing") : t("Unpublish this sequence")}
      {unpublishing && <i className={"fa fa-spinner fa-pulse"} />}
    </button>
  </div>;
};

export const SequenceBtnGroup = ({
  dispatch,
  sequence,
  syncStatus,
  resources,
  sequencesState,
  getWebAppConfigValue,
  toggleViewSequenceCeleryScript,
  viewCeleryScript,
  visualized,
}: SequenceBtnGroupProps) => {
  const [processingTitle, setProcessingTitle] = React.useState(false);
  const [processingColor, setProcessingColor] = React.useState(false);
  const isProcessing = processingColor || processingTitle;
  return <div className="button-group">
    <SaveBtn status={sequence.specialStatus}
      onClick={() => dispatch(save(sequence.uuid)).then(() =>
        push(Path.sequences(urlFriendly(sequence.body.name))))} />
    <TestButton component={"editor"}
      key={JSON.stringify(sequence)}
      syncStatus={syncStatus}
      sequence={sequence}
      resources={resources}
      menuOpen={sequencesState.menuOpen}
      dispatch={dispatch} />
    <div className={"settings-menu-button"}>
      <Popover position={Position.BOTTOM_RIGHT}
        target={<i className={"fa fa-gear fb-icon-button"}
          title={t("settings")} />}
        content={<SequenceSettingsMenu
          dispatch={dispatch}
          getWebAppConfigValue={getWebAppConfigValue} />} />
    </div>
    {getWebAppConfigValue(BooleanSetting.view_celery_script) &&
      <i title={t("toggle celery script view")}
        className={[
          "fa fa-code fb-icon-button",
          viewCeleryScript ? "" : "inactive",
        ].join(" ")}
        onClick={toggleViewSequenceCeleryScript} />}
    <i title={sequence.body.pinned ? t("unpin sequence") : t("pin sequence")}
      className={[
        "fa",
        "fa-thumb-tack",
        "fb-icon-button",
        sequence.body.pinned ? "" : "inactive",
      ].join(" ")}
      onClick={() => dispatch(pinSequenceToggle(sequence))} />
    {Path.inDesigner() &&
      <i
        className={[
          "fa",
          visualized ? "fa-eye" : "fa-eye-slash inactive",
          "fb-icon-button",
        ].join(" ")}
        title={visualized ? t("unvisualize") : t("visualize")}
        onClick={() =>
          dispatch(visualizeInMap(visualized ? undefined : sequence.uuid))} />}
    <i className={"fa fa-copy fb-icon-button"}
      title={t("copy sequence")}
      onClick={() => dispatch(copySequence(sequence))} />
    <i className={"fa fa-trash fb-icon-button"}
      title={t("delete sequence")}
      onClick={deleteSequence({
        sequenceUuid: sequence.uuid,
        getWebAppConfigValue,
        dispatch,
      })} />
    <div className={"publish-button"}>
      <Popover position={Position.BOTTOM_RIGHT}
        target={<i className={"fa fa-share fb-icon-button"}
          title={t("share sequence")} />}
        content={isSequencePublished(sequence)
          ? <SequenceShareMenu sequence={sequence} />
          : <SequencePublishMenu sequence={sequence} />} />
    </div>
    {!Path.inDesigner() &&
      <Popover className={"color-picker"}
        position={Position.BOTTOM}
        popoverClassName={"colorpicker-menu gray"}
        target={<i title={t("select color")}
          className={"fa fa-paint-brush fb-icon-button"} />}
        content={<ColorPickerCluster
          onChange={color =>
            editCurrentSequence(dispatch, sequence, { color })}
          current={sequence.body.color} />} />}
    {!Path.inDesigner() && <AutoGenerateButton
      dispatch={dispatch}
      sequence={sequence}
      isProcessing={isProcessing}
      setTitleProcessing={setProcessingTitle}
      setColorProcessing={setProcessingColor} />}
  </div>;
};

interface DeleteSequenceProps {
  getWebAppConfigValue: GetWebAppConfigValue;
  dispatch: Function;
  sequenceUuid: UUID;
}

export const deleteSequence = (props: DeleteSequenceProps) => () => {
  const confirm = props.getWebAppConfigValue(
    BooleanSetting.confirm_sequence_deletion);
  const force = !(confirm ?? true);
  props.dispatch(destroy(props.sequenceUuid, force))
    .then(() => push(Path.sequences()));
};

export const isSequencePublished = (sequence: TaggedSequence) =>
  !sequence.body.sequence_version_id
  && !sequence.body.forked
  && !!sequence.body.sequence_versions?.length;

const isSequenceImportedOrPublished = (sequence: TaggedSequence) =>
  sequence.body.sequence_version_id || !!sequence.body.sequence_versions?.length;

interface SequenceNameProps {
  dispatch: Function;
  sequence: TaggedSequence;
}

export const SequenceName =
  ({ dispatch, sequence }: SequenceNameProps) =>
    <Row>
      <Col xs={12}>
        <BlurableInput className={"sequence-name"}
          value={sequence.body.name}
          placeholder={t("Sequence Name")}
          onCommit={e =>
            dispatch(edit(sequence, { name: e.currentTarget.value }))} />
      </Col>
    </Row>;

export const SequenceHeader = (props: SequenceHeaderProps) => {
  const { sequence, dispatch } = props;
  const sequenceAndDispatch = { sequence, dispatch };
  const color = Path.inDesigner() ? "" : sequence.body.color;
  const page = Path.inDesigner() ? "" : "page";
  return <div id="sequence-editor-tools"
    className={`sequence-editor-tools ${color} ${page}`}>
    {props.showName &&
      <ResourceTitle
        key={sequence.body.name}
        resource={sequence}
        fallback={t("No Sequence selected")}
        dispatch={dispatch} />}
    <SequenceBtnGroup {...sequenceAndDispatch}
      syncStatus={props.syncStatus}
      resources={props.resources}
      getWebAppConfigValue={props.getWebAppConfigValue}
      toggleViewSequenceCeleryScript={props.toggleViewSequenceCeleryScript}
      viewCeleryScript={props.viewCeleryScript}
      visualized={props.visualized}
      sequencesState={props.sequencesState} />
  </div>;
};

export class SequenceEditorMiddleActive extends
  React.Component<ActiveMiddleProps, ActiveMiddleState> {
  state: ActiveMiddleState = {
    variablesCollapsed: false,
    descriptionCollapsed: !this.props.sequence.body.description,
    stepsCollapsed: false,
    licenseCollapsed: true,
    viewSequenceCeleryScript: false,
    sequencePreview: undefined,
    error: false,
    view: "local",
    addVariableMenuOpen: false,
  };

  componentDidMount = () => {
    const versionIds = sortBy(this.props.sequence.body.sequence_versions);
    const latestVersionId = last(versionIds);
    latestVersionId && this.loadSequenceVersion("" + latestVersionId);
  };

  get stepProps(): AllStepsProps {
    const getConfig = this.props.getWebAppConfigValue;
    return {
      sequence: this.props.sequence,
      sequences: this.props.sequences,
      onDrop: onDrop(this.props.dispatch, this.props.sequence),
      dispatch: this.props.dispatch,
      readOnly: false,
      resources: this.props.resources,
      hardwareFlags: this.props.hardwareFlags,
      farmwareData: this.props.farmwareData,
      showPins: !!getConfig(BooleanSetting.show_pins),
      expandStepOptions: !!getConfig(BooleanSetting.expand_step_options),
      visualized: this.props.visualized,
      hoveredStep: this.props.hoveredStep,
      sequencesState: this.props.sequencesState,
    };
  }

  toggleSection = (key: keyof ActiveMiddleState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });
  setSequencePreview = (sequencePreview: TaggedSequence) =>
    this.setState({
      sequencePreview,
      descriptionCollapsed: !sequencePreview.body.description,
    });
  setError = () => this.setState({ error: true });

  loadSequenceVersion = (id: string) => loadSequenceVersion({
    id,
    onSuccess: this.setSequencePreview,
    onError: this.setError,
  });

  addVariable = (
    variableData: VariableNameSet,
    declarations: (ParameterDeclaration | VariableDeclaration)[],
    variableType: VariableType,
  ) => (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const label = generateNewVariableLabel(
      Object.values(variableData).map(data => data?.celeryNode),
      newVariableLabel(variableType));
    localListCallback(this.props)(declarations)(
      variableType == VariableType.Resource
        ? {
          kind: "parameter_declaration",
          args: {
            label, default_value: {
              kind: "resource_placeholder",
              args: { resource_type: "Sequence" },
            }
          }
        }
        : {
          kind: "variable_declaration",
          args: { label, data_value: newVariableDataValue(variableType) }
        }, label);
    this.setState({ addVariableMenuOpen: false });
  };

  openAddVariableMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    this.setState({
      addVariableMenuOpen: !this.state.addVariableMenuOpen,
    });
  };

  render() {
    const { dispatch, sequence } = this.props;
    const { viewSequenceCeleryScript, view } = this.state;
    const variableData = this.props.resources.sequenceMetas[sequence.uuid] || {};
    const declarations = betterCompact(Object.values(variableData)
      .map(v => v && isScopeDeclarationBodyItem(v.celeryNode)
        ? v.celeryNode
        : undefined));
    const stepCount = (sequence.body.body || []).length;
    return <div className="sequence-editor-content">
      <ImportedBanner
        sequence={sequence}
        selectedVersionId={this.state.sequencePreview?.body.id}
        selectVersionId={ddi => this.loadSequenceVersion("" + ddi.value)}
        selectView={view => () => this.setState({ view })}
        view={view} />
      {view == "local"
        ? <SequenceHeader
          showName={this.props.showName}
          dispatch={this.props.dispatch}
          sequence={sequence}
          resources={this.props.resources}
          syncStatus={this.props.syncStatus}
          toggleViewSequenceCeleryScript={
            this.toggleSection("viewSequenceCeleryScript")}
          viewCeleryScript={viewSequenceCeleryScript}
          getWebAppConfigValue={this.props.getWebAppConfigValue}
          visualized={this.props.visualized}
          sequencesState={this.props.sequencesState} />
        : <PublicCopyToolbar
          sequence={sequence}
          sequencePreview={this.state.sequencePreview}
          viewCeleryScript={
            !!this.props.getWebAppConfigValue(BooleanSetting.view_celery_script)}
          viewSequenceCeleryScript={viewSequenceCeleryScript}
          toggleViewSequenceCeleryScript={
            this.toggleSection("viewSequenceCeleryScript")}
          showName={this.props.showName} />}
      {Path.inDesigner() && <hr />}
      {view == "local"
        ? <div className={"sequence-editor-sections"}>
          <Description
            isOpen={!this.state.descriptionCollapsed}
            toggleOpen={this.toggleSection("descriptionCollapsed")}
            key={sequence.uuid + sequence.body.description}
            dispatch={dispatch}
            sequence={sequence} />
          {!viewSequenceCeleryScript &&
            <SectionHeader title={t("Variables")}
              count={Object.values(variableData).length}
              buttonElement={<Popover position={Position.TOP} usePortal={false}
                isOpen={this.state.addVariableMenuOpen}
                target={<button
                  className={"fb-button gray add-variable-btn"}
                  onClick={this.openAddVariableMenu}
                  title={t("Add variable")}>
                  <i className={"fa fa-plus"} />
                </button>}
                content={<div className={"add-variable-options"}>
                  <button className={"fb-button gray"}
                    onClick={this.addVariable(variableData, declarations,
                      VariableType.Location)}>
                    {t("location")}
                  </button>
                  <button className={"fb-button gray"}
                    onClick={this.addVariable(variableData, declarations,
                      VariableType.Number)}>
                    {t("number")}
                  </button>
                  <button className={"fb-button gray"}
                    onClick={this.addVariable(variableData, declarations,
                      VariableType.Text)}>
                    {t("text")}
                  </button>
                  <button className={"fb-button gray"}
                    onClick={this.addVariable(variableData, declarations,
                      VariableType.Resource)}>
                    {t("resource")}
                  </button>
                </div>} />}
              collapsed={this.state.variablesCollapsed}
              toggle={this.toggleSection("variablesCollapsed")} />}
          {!viewSequenceCeleryScript &&
            <Collapse isOpen={!this.state.variablesCollapsed}>
              <ErrorBoundary>
                <LocalsList
                  variableData={variableData}
                  sequenceUuid={sequence.uuid}
                  resources={this.props.resources}
                  onChange={localListCallback(this.props)(declarations)}
                  removeVariable={removeVariable({
                    dispatch,
                    resource: sequence,
                    variableData: {},
                  })}
                  locationDropdownKey={JSON.stringify(sequence)}
                  allowedVariableNodes={AllowedVariableNodes.parameter}
                  hideGroups={true} />
              </ErrorBoundary>
            </Collapse>}
          {viewSequenceCeleryScript &&
            <pre>{stringifySequenceData(this.props.sequence.body)}</pre>}
          {!viewSequenceCeleryScript &&
            <SectionHeader title={t("sequence steps")}
              count={stepCount}
              collapsed={this.state.stepsCollapsed}
              toggle={this.toggleSection("stepsCollapsed")} />}
          {!viewSequenceCeleryScript &&
            <Collapse isOpen={!this.state.stepsCollapsed}>
              <div className="sequence" id="sequenceDiv">
                <div className={"sequence-step-components"}>
                  <ErrorBoundary>
                    <AllSteps {...this.stepProps} />
                    <AddCommandButton key={stepCount == 0 ? 1 : undefined}
                      dispatch={dispatch}
                      stepCount={stepCount}
                      sequence={this.props.sequence}
                      farmwareData={this.props.farmwareData}
                      sequences={this.props.sequences}
                      resources={this.props.resources}
                      index={Infinity} />
                  </ErrorBoundary>
                  <Row>
                    <Col xs={12}>
                      <DropArea isLocked={true}
                        callback={key => onDrop(dispatch, sequence)(Infinity, key)}>
                        {t("DRAG COMMAND HERE")}
                      </DropArea>
                    </Col>
                  </Row>
                </div>
              </div>
            </Collapse>}
          {isSequenceImportedOrPublished(sequence) &&
            <License
              collapsed={this.state.licenseCollapsed}
              sequence={sequence}
              dispatch={dispatch}
              toggle={this.toggleSection("licenseCollapsed")} />}
          <div className={"padding"} />
        </div>
        : <SequencePreviewContent
          viewCeleryScript={!!this.props.getWebAppConfigValue(
            BooleanSetting.view_celery_script)}
          dispatch={this.props.dispatch}
          resources={this.props.resources}
          toggleSection={this.toggleSection}
          sequencesState={this.props.sequencesState}
          {...this.state}
          sequence={this.state.sequencePreview} />}
    </div>;
  }
}

interface DescriptionProps {
  dispatch: Function;
  sequence: TaggedSequence;
  isOpen: boolean;
  toggleOpen(): void;
}

const Description = (props: DescriptionProps) => {
  const sequenceDescription = props.sequence.body.description || "";
  const [description, setDescription] = React.useState(sequenceDescription);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  return <div className={"sequence-description-wrapper"}>
    <SectionHeader title={t("Description")}
      collapsed={!props.isOpen}
      toggle={props.toggleOpen} />
    {props.isOpen &&
      <i title={t("auto-generate sequence description")}
        className={[
          "fa",
          isProcessing ? "fa-spinner fa-pulse" : "fa-magic",
          "fb-icon-button",
        ].join(" ")}
        onClick={() => {
          if (!props.sequence.body.id) {
            error(t("Save sequence first."));
            return;
          }
          setIsProcessing(true);
          requestAutoGeneration({
            contextKey: "description",
            sequenceId: props.sequence.body.id,
            onUpdate: description => setDescription(description),
            onSuccess: description => {
              setIsProcessing(false);
              props.dispatch(edit(props.sequence, { description }));
            },
            onError: () => setIsProcessing(false),
          });
        }} />}
    {props.isOpen &&
      <i title={t("toggle editor view")}
        className={[
          "fa",
          isEditing ? "fa-eye" : "fa-pencil",
          "fb-icon-button",
        ].join(" ")}
        onClick={() => setIsEditing(!isEditing)} />}
    <Collapse isOpen={props.isOpen}>
      <div className={"sequence-description"}
        key={props.sequence.uuid + props.sequence.body.description}>
        {isEditing
          ? <div className={"description-input"}>
            <textarea
              value={description}
              onChange={e => setDescription(e.currentTarget.value)}
              onBlur={() => props.dispatch(edit(props.sequence, {
                description
              }))} />
          </div>
          : <Markdown>{description}</Markdown>}
        <div className={"description-editor-tools"}>
          {isEditing && <InputLengthIndicator field={"description"}
            alwaysShow={true}
            value={description} />}
        </div>
      </div>
    </Collapse>
  </div>;
};

interface ImportedBannerProps {
  sequence: TaggedSequence;
  selectedVersionId: number | undefined;
  selectVersionId(ddi: DropDownItem): void;
  selectView(view: "local" | "public"): () => void;
  view: "local" | "public";
}

export const ImportedBanner = (props: ImportedBannerProps) => {
  const versionId = props.sequence.body.sequence_version_id;
  const allIds = sortBy(props.sequence.body.sequence_versions);
  const latestId = last(allIds);
  const versionList = sequenceVersionList(allIds);
  const selectVersion = (id: number | undefined) =>
    versionList.find(v => v.value == id);
  const currentVersionItem = selectVersion(versionId);
  const forked = !!props.sequence.body.forked;
  const upgradeAvailable = ((versionId != latestId) || forked);
  const revertAvailable = (versionId == latestId) && forked;
  const currentVersionLabel = <p>
    {currentVersionItem?.label}
    <i className={`fa ${forked ? "fa-chain-broken" : "fa-link"}`} />
  </p>;
  const includesLua = props.sequence.body.body?.map(x => x.kind).includes("lua");
  return versionId
    ? <div className={"import-banners"}>
      <div className={"imported-banner"}>
        <label>{t("this sequence was imported")}</label>
        <Help text={Content.IMPORTED_SEQUENCE} />
        {upgradeAvailable &&
          <button className={"transparent-button"}
            onClick={upgradeSequence(props.sequence.body.id, latestId)}>
            {revertAvailable ? t("revert changes") : t("upgrade to latest")}
          </button>}
        {includesLua && <p>{t(Content.INCLUDES_LUA_WARNING)}</p>}
      </div>
      <div className={"upgrade-compare-banner"}>
        <div className={`copy-item ${props.view == "local" ? "selected" : ""}`}
          onClick={props.selectView("local")}>
          <label>{t("your copy")}</label>
          {forked
            ? <Popover
              position={Position.TOP_RIGHT}
              interactionKind={PopoverInteractionKind.CLICK}
              popoverClassName={"help"}
              target={currentVersionLabel}
              content={<div className={"help-text-content"}>
                {t(Content.SEQUENCE_FORKED)}
              </div>} />
            : currentVersionLabel}
        </div>
        <div className={`copy-item ${props.view == "local" ? "" : "selected"}`}
          onClick={props.selectView("public")}>
          <label>{t("public copy")}</label>
          <FBSelect
            key={props.selectedVersionId}
            selectedItem={selectVersion(props.selectedVersionId || latestId)}
            onChange={props.selectVersionId}
            list={versionList} />
        </div>
      </div>
    </div>
    : <div />;
};

interface PublicCopyToolbarProps {
  sequencePreview: TaggedSequence | undefined;
  sequence: TaggedSequence;
  viewSequenceCeleryScript: boolean;
  showName: boolean;
  viewCeleryScript: boolean;
  toggleViewSequenceCeleryScript: () => void;
}

const PublicCopyToolbar = (props: PublicCopyToolbarProps) => {
  const previewVersionId = props.sequencePreview?.body.id;
  return <div className={"public-copy-toolbar"}>
    {props.showName && <p>{props.sequencePreview?.body.name}</p>}
    {props.viewCeleryScript &&
      <i title={t("toggle celery script view")}
        className={["fa fa-code fb-icon-button",
          props.viewSequenceCeleryScript ? "" : "inactive",
        ].join(" ")}
        onClick={props.toggleViewSequenceCeleryScript} />}
    <button className={"fb-button orange"}
      onClick={upgradeSequence(props.sequence.body.id, previewVersionId)}>
      {t("upgrade your copy to this version")}
    </button>
    <Link
      to={previewVersionId ? Path.sequenceVersion(previewVersionId) : ""}>
      <i className={"fa fa-link"} />
    </Link>
  </div>;
};

export interface AddCommandButtonProps {
  dispatch: Function;
  index: number;
  stepCount: number;
  sequence: TaggedSequence | undefined;
  farmwareData: FarmwareData | undefined;
  sequences?: TaggedSequence[];
  resources: ResourceIndex;
}

export const AddCommandButton = (props: AddCommandButtonProps) => {
  const { index, dispatch, stepCount } = props;
  const getPositionClass = () => {
    switch (index) {
      case 0: return "first";
      case Infinity: return stepCount == 0 ? "only" : "last";
      default: return "middle";
    }
  };
  const [collapsed, setCollapsed] = React.useState(stepCount != 0);
  return <div className={[
    "add-command-button-container",
    getPositionClass(),
    collapsed ? "" : "open",
  ].join(" ")}>
    <button
      className={"add-command fb-button gray"}
      title={t("add sequence step")}
      onClick={() => {
        setCollapsed(!collapsed);
        dispatch({
          type: Actions.SET_SEQUENCE_STEP_POSITION,
          payload: index,
        });
      }}>
      <i className={"fa fa-plus"} />
    </button>
    <Collapse isOpen={!collapsed}>
      <StepButtonCluster
        close={() => setCollapsed(true)}
        current={props.sequence}
        dispatch={dispatch}
        farmwareData={props.farmwareData}
        sequences={props.sequences}
        resources={props.resources}
        stepIndex={index} />
    </Collapse>
  </div>;
};

export interface SectionHeaderProps {
  title: string;
  collapsed: boolean;
  toggle(): void;
  count?: number;
  buttonElement?: JSX.Element | false;
  extraClass?: string;
}

export const SectionHeader = (props: SectionHeaderProps) =>
  <div className={`sequence-section-header ${props.extraClass}`}
    onClick={props.toggle}>
    <label>{!isUndefined(props.count)
      ? `${t(props.title)} (${props.count})`
      : t(props.title)}</label>
    <i className={`fa fa-caret-${props.collapsed ? "down" : "up"}`} />
    {!props.collapsed && props.buttonElement}
  </div>;
