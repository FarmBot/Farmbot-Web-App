import React from "react";
import { t } from "../i18next_wrapper";
import {
  ActiveMiddleProps, SequenceHeaderProps, SequenceBtnGroupProps,
  SequenceSettingProps, SequenceSettingsMenuProps, ActiveMiddleState,
  SequenceShareMenuProps,
} from "./interfaces";
import {
  editCurrentSequence, copySequence, pinSequenceToggle, publishSequence,
  upgradeSequence,
  unpublishSequence,
} from "./actions";
import { splice, move, stringifySequenceData } from "./step_tiles";
import { push } from "../history";
import {
  BlurableInput, Row, Col, SaveBtn, ColorPicker, Help, ToggleButton, Popover,
  Markdown,
  FBSelect,
  DropDownItem,
} from "../ui";
import { DropArea } from "../draggable/drop_area";
import { stepGet } from "../draggable/actions";
import { SpecialStatus, TaggedSequence } from "farmbot";
import { save, edit, destroy } from "../api/crud";
import { TestButton } from "./test_button";
import { AllSteps, AllStepsProps } from "./all_steps";
import {
  LocalsList, localListCallback, removeVariable,
} from "./locals_list/locals_list";
import { betterCompact, urlFriendly } from "../util";
import { AllowedVariableNodes } from "./locals_list/locals_list_support";
import { isScopeDeclarationBodyItem } from "./locals_list/handle_select";
import { Content, Actions, DeviceSetting } from "../constants";
import { Collapse, PopoverInteractionKind, Position } from "@blueprintjs/core";
import { setWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { clone, isUndefined, last, sortBy } from "lodash";
import { ErrorBoundary } from "../error_boundary";
import { sequencesUrlBase, inDesigner } from "../folders/component";
import { visualizeInMap } from "../farm_designer/map/sequence_visualization";
import { getModifiedClassName } from "../settings/default_values";
import { DevSettings } from "../settings/dev/dev_support";
import { error } from "../toast/toast";
import { Link } from "../link";
import { API } from "../api";
import { ExternalUrl } from "../external_urls";
import { InputLengthIndicator } from "./inputs/input_length_indicator";
import {
  License, loadSequenceVersion, SequencePreviewContent,
} from "./panel/preview";

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

const publishAction = (setState: (state: boolean) => void) => {
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
      <p>
        {t(Content.PUBLISH_SEQUENCE_UNPUBLISH)}
      </p>
      <p style={{ paddingBottom: 0 }}>
        {`${t("By publishing this sequence, you will be releasing it under the")} `}
        <MitLicenseLink />.
      </p>
      <label>{t("copyright holders")}:</label>
      <input defaultValue={copyright}
        onChange={e => setCopyright(e.currentTarget.value)} />
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
  const linkPath = sequenceVersionPath(last(ids));
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
        <i className={`fa fa-${publishing ? "spinner fa-pulse" : "plus"}`} />
      </button>
      {sequenceVersionList(ids).map(version =>
        <Row key={version.label}>
          <Col xs={6}>
            <p>{version.label}</p>
          </Col>
          <Col xs={6}>
            <Link to={sequenceVersionPath(version.value)}>
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
  menuOpen,
  getWebAppConfigValue,
  toggleViewSequenceCeleryScript,
  viewCeleryScript,
  visualized,
}: SequenceBtnGroupProps) =>
  <div className="button-group">
    <SaveBtn status={sequence.specialStatus}
      onClick={() => dispatch(save(sequence.uuid)).then(() =>
        push(sequencesUrlBase() + urlFriendly(sequence.body.name)))} />
    <TestButton
      key={JSON.stringify(sequence)}
      syncStatus={syncStatus}
      sequence={sequence}
      resources={resources}
      menuOpen={menuOpen}
      dispatch={dispatch} />
    <div className={"settings-menu-button"}>
      <Popover position={Position.BOTTOM_RIGHT}
        target={<i className="fa fa-gear" title={t("settings")} />}
        content={<SequenceSettingsMenu
          dispatch={dispatch}
          getWebAppConfigValue={getWebAppConfigValue} />} />
    </div>
    {getWebAppConfigValue(BooleanSetting.view_celery_script) &&
      <i className={`fa fa-code ${viewCeleryScript ? "enabled" : ""} step-control`}
        title={t("toggle celery script view")}
        onClick={toggleViewSequenceCeleryScript} />}
    <ColorPicker
      current={sequence.body.color}
      onChange={color =>
        editCurrentSequence(dispatch, sequence, { color })} />
    <i title={sequence.body.pinned ? t("unpin sequence") : t("pin sequence")}
      className={[
        "fa",
        "fa-thumb-tack",
        sequence.body.pinned ? "pinned" : "",
      ].join(" ")}
      onClick={() => dispatch(pinSequenceToggle(sequence))} />
    {inDesigner() &&
      <i className={`fa fa-eye${visualized ? "" : "-slash"}`}
        title={visualized ? t("unvisualize") : t("visualize")}
        onClick={() =>
          dispatch(visualizeInMap(visualized ? undefined : sequence.uuid))} />}
    <i className={"fa fa-copy"}
      title={t("copy sequence")}
      onClick={() => dispatch(copySequence(sequence))} />
    <i className={"fa fa-trash"}
      title={t("delete sequence")}
      onClick={() => {
        const confirm = getWebAppConfigValue(
          BooleanSetting.confirm_sequence_deletion);
        const force = !(confirm ?? true);
        dispatch(destroy(sequence.uuid, force))
          .then(() => push(sequencesUrlBase()));
      }} />
    {DevSettings.futureFeaturesEnabled() &&
      <div className={"publish-button"}>
        <Popover position={Position.BOTTOM_RIGHT}
          target={<i className={"fa fa-share"} title={t("share sequence")} />}
          content={isSequencePublished(sequence)
            ? <SequenceShareMenu sequence={sequence} />
            : <SequencePublishMenu sequence={sequence} />} />
      </div>}
  </div>;

export const isSequencePublished = (sequence: TaggedSequence) =>
  !sequence.body.sequence_version_id
  && !sequence.body.forked
  && !!sequence.body.sequence_versions?.length;

interface SequenceNameProps {
  dispatch: Function;
  sequence: TaggedSequence;
}

export const SequenceName =
  ({ dispatch, sequence }: SequenceNameProps) =>
    <Row>
      <Col xs={12}>
        <BlurableInput value={sequence.body.name}
          placeholder={t("Sequence Name")}
          onCommit={e =>
            dispatch(edit(sequence, { name: e.currentTarget.value }))} />
      </Col>
    </Row>;

export const SequenceHeader = (props: SequenceHeaderProps) => {
  const { sequence, dispatch } = props;
  const sequenceAndDispatch = { sequence, dispatch };
  return <div id="sequence-editor-tools" className="sequence-editor-tools">
    <SequenceBtnGroup {...sequenceAndDispatch}
      syncStatus={props.syncStatus}
      resources={props.resources}
      getWebAppConfigValue={props.getWebAppConfigValue}
      toggleViewSequenceCeleryScript={props.toggleViewSequenceCeleryScript}
      viewCeleryScript={props.viewCeleryScript}
      visualized={props.visualized}
      menuOpen={props.menuOpen} />
    {props.showName &&
      <SequenceName {...sequenceAndDispatch} />}
  </div>;
};

export class SequenceEditorMiddleActive extends
  React.Component<ActiveMiddleProps, ActiveMiddleState> {
  state: ActiveMiddleState = {
    variablesCollapsed: false,
    descriptionCollapsed: !this.props.sequence.body.description,
    stepsCollapsed: false,
    licenseCollapsed: true,
    editingDescription: false,
    description: this.props.sequence.body.description || "",
    viewSequenceCeleryScript: false,
    sequencePreview: undefined,
    error: false,
    view: "local",
  };

  componentDidMount = () => {
    const versionIds = sortBy(this.props.sequence.body.sequence_versions);
    const latestVersionId = last(versionIds);
    latestVersionId && this.loadSequenceVersion("" + latestVersionId);
  }

  get stepProps(): AllStepsProps {
    const getConfig = this.props.getWebAppConfigValue;
    return {
      sequence: this.props.sequence,
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
    };
  }

  toggleSection = (key: keyof ActiveMiddleState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });
  setDescription = (description: string) => this.setState({ description });
  setSequencePreview = (sequencePreview: TaggedSequence) =>
    this.setState({ sequencePreview });
  setError = () => this.setState({ error: true });

  loadSequenceVersion = (id: string) => loadSequenceVersion({
    id,
    onSuccess: this.setSequencePreview,
    onError: this.setError,
  })

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
          menuOpen={this.props.menuOpen} />
        : <PublicCopyToolbar
          sequence={sequence}
          sequencePreview={this.state.sequencePreview}
          viewCeleryScript={
            !!this.props.getWebAppConfigValue(BooleanSetting.view_celery_script)}
          viewSequenceCeleryScript={viewSequenceCeleryScript}
          toggleViewSequenceCeleryScript={
            this.toggleSection("viewSequenceCeleryScript")}
          showName={this.props.showName} />}
      <hr />
      {view == "local"
        ? <div className={"sequence-editor-sections"}>
          <SectionHeader title={t("Description")}
            collapsed={this.state.descriptionCollapsed}
            toggle={this.toggleSection("descriptionCollapsed")} />
          <Collapse isOpen={!this.state.descriptionCollapsed}>
            <Description
              dispatch={dispatch}
              editing={this.state.editingDescription}
              sequence={sequence}
              description={this.state.description}
              setDescription={this.setDescription}
              toggleEditing={this.toggleSection("editingDescription")} />
          </Collapse>
          {!viewSequenceCeleryScript &&
            <SectionHeader title={t("Variables")}
              count={Object.values(variableData).length}
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
                  toggleVarShow={this.toggleSection("variablesCollapsed")}
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
                    <AddCommandButton dispatch={dispatch}
                      stepCount={stepCount}
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
          {(sequence.body.sequence_version_id
            || !!sequence.body.sequence_versions?.length) &&
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
          {...this.state}
          sequence={this.state.sequencePreview} />}
    </div>;
  }
}

interface DescriptionProps {
  dispatch: Function;
  editing: boolean;
  sequence: TaggedSequence;
  description: string;
  setDescription(description: string): void;
  toggleEditing(): void;
}

const Description = (props: DescriptionProps) =>
  <div className={"sequence-description"}>
    {props.editing
      ? <div className={"description-input"}>
        <textarea
          value={props.description}
          onChange={e => props.setDescription(e.currentTarget.value)}
          onBlur={() => props.dispatch(edit(props.sequence, {
            description: props.description,
          }))} />
      </div>
      : <Markdown>{props.description}</Markdown>}
    <div className={"description-editor-tools"}>
      <i className={`fa fa-${props.editing ? "eye" : "pencil"}`}
        title={t("toggle editor view")}
        onClick={props.toggleEditing} />
      {props.editing && <InputLengthIndicator field={"description"}
        alwaysShow={true}
        value={props.description} />}
    </div>
  </div>;

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
  const currentVersionLabel = <p>
    {currentVersionItem?.label}
    <i className={`fa fa-${forked ? "chain-broken" : "link"}`} />
  </p>;
  return versionId
    ? <div className={"import-banners"}>
      <div className={"imported-banner"}>
        <label>{t("this sequence was imported")}</label>
        <Help text={Content.IMPORTED_SEQUENCE} />
        {upgradeAvailable &&
          <button className={"transparent-button"}
            onClick={upgradeSequence(props.sequence.body.id, latestId)}>
            {t("upgrade to latest")}
          </button>}
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
        className={["fa fa-code",
          props.viewSequenceCeleryScript ? "enabled" : "",
          "step-control",
        ].join(" ")}
        onClick={props.toggleViewSequenceCeleryScript} />}
    <button className={"fb-button orange"}
      onClick={upgradeSequence(props.sequence.body.id, previewVersionId)}>
      {t("upgrade your copy to this version")}
    </button>
    <Link
      to={sequenceVersionPath(previewVersionId)}>
      <i className={"fa fa-link"} />
    </Link>
  </div>;
};

export const sequenceVersionPath = (id: string | number | undefined) =>
  `/app/shared/sequence/${id}`;

export interface AddCommandButtonProps {
  dispatch: Function;
  index: number;
  stepCount: number;
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
  return <div className={`add-command-button-container ${getPositionClass()}`}>
    <button
      className="add-command fb-button gray"
      title={t("add sequence step")}
      onClick={() => {
        dispatch({
          type: Actions.SET_SEQUENCE_STEP_POSITION,
          payload: index,
        });
        inDesigner() && push("/app/designer/sequences/commands");
      }}>
      {stepCount == 0
        ? t("add command")
        : <i className={"fa fa-plus"} />}
    </button>
  </div>;
};

export interface SectionHeaderProps {
  title: string;
  collapsed: boolean;
  toggle(): void;
  count?: number;
}

export const SectionHeader = (props: SectionHeaderProps) =>
  <div className={"sequence-section-header"} onClick={props.toggle}>
    <label>{!isUndefined(props.count)
      ? `${t(props.title)} (${props.count})`
      : t(props.title)}</label>
    <i className={`fa fa-caret-${props.collapsed ? "down" : "up"}`} />
  </div>;
