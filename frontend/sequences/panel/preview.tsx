import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { t } from "../../i18next_wrapper";
import { EmptyStateWrapper, EmptyStateGraphic, Help, Markdown } from "../../ui";
import { isTaggedSequence } from "../../resources/tagged_resources";
import { ResourceTitle } from "./editor";
import { Everything } from "../../interfaces";
import { SpecialStatus, TaggedSequence } from "farmbot";
import axios from "axios";
import { API } from "../../api";
import { getPathArray, push } from "../../history";
import { noop } from "lodash";
import { ErrorBoundary } from "../../error_boundary";
import { AllSteps } from "../all_steps";
import { LocalsList } from "../locals_list/locals_list";
import { AllowedVariableNodes } from "../locals_list/locals_list_support";
import { ResourceIndex } from "../../resources/interfaces";
import { createSequenceMeta } from "../../resources/sequence_meta";
import { maybeTagStep } from "../../resources/sequence_tagging";
import { Content } from "../../constants";
import { BooleanSetting } from "../../session_keys";
import {
  getWebAppConfigValue, GetWebAppConfigValue,
} from "../../config_storage/actions";
import { stringifySequenceData } from "../step_tiles";
import { installSequence } from "../actions";
import { Collapse } from "@blueprintjs/core";
import {
  isSequencePublished, publishAction, SectionHeader, sequenceVersionPath,
} from "../sequence_editor_middle_active";
import moment from "moment";
import { edit } from "../../api/crud";
import { urlFriendly } from "../../util";
import { setActiveSequenceByName } from "../set_active_sequence_by_name";

interface LoadSequenceVersionProps {
  id: string;
  onSuccess(sequence: TaggedSequence): void;
  onError(): void;
}

export const loadSequenceVersion = (props: LoadSequenceVersionProps) =>
  axios.get(API.current.sequenceVersionsPath + props.id)
    .then(response => {
      const sequence: TaggedSequence = {
        kind: "Sequence",
        uuid: "Sequence.0",
        specialStatus: SpecialStatus.SAVED,
        body: response.data,
      };
      sequence.body.name = sequence.body.name || `Shared Sequence ${props.id}`;
      sequence.body.body?.map(step => maybeTagStep(step));
      props.onSuccess(sequence);
    }, props.onError);

export interface SequencePreviewProps {
  dispatch: Function;
  resources: ResourceIndex;
  getWebAppConfigValue: GetWebAppConfigValue;
}

export function mapStateToProps(props: Everything): SequencePreviewProps {
  return {
    dispatch: props.dispatch,
    resources: props.resources.index,
    getWebAppConfigValue: getWebAppConfigValue(() => props),
  };
}

interface SequencePreviewState {
  sequence: TaggedSequence | undefined;
  viewSequenceCeleryScript: boolean;
  variablesCollapsed: boolean;
  descriptionCollapsed: boolean;
  stepsCollapsed: boolean;
  licenseCollapsed: boolean;
  error: boolean;
}

export class RawDesignerSequencePreview
  extends React.Component<SequencePreviewProps, SequencePreviewState> {
  state: SequencePreviewState = {
    sequence: undefined,
    viewSequenceCeleryScript: false,
    variablesCollapsed: false,
    descriptionCollapsed: false,
    stepsCollapsed: false,
    licenseCollapsed: true,
    error: false,
  };

  componentDidMount = () => {
    loadSequenceVersion({
      id: getPathArray()[sequenceVersionPath(0).split("/").length - 1],
      onSuccess: sequence => this.setState({ sequence }),
      onError: () => this.setState({ error: true }),
    });
  }

  toggleSection = (key: keyof SequencePreviewState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });

  render() {
    const panelName = "designer-sequence-editor";
    const { sequence } = this.state;
    const viewCeleryScript = this.props.getWebAppConfigValue(
      BooleanSetting.view_celery_script);
    return <DesignerPanel panelName={panelName} panel={Panel.Sequences}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Sequences}
        titleElement={<ResourceTitle
          key={sequence?.body.name}
          readOnly={true}
          resource={sequence}
          fallback={this.state.error ? t("Sequence not found") : t("Loading...")}
          dispatch={this.props.dispatch} />}
        backTo={"/app/designer/sequences"} />
      <DesignerPanelContent panelName={panelName}>
        <ImportBanner sequence={sequence} />
        <div className={"sequence-editor-content"}>
          <SequencePreviewContent
            viewCeleryScript={!!viewCeleryScript}
            dispatch={this.props.dispatch}
            resources={this.props.resources}
            toggleSection={this.toggleSection}
            showToolbar={true}
            {...this.state} />
        </div>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSequencePreview =
  connect(mapStateToProps)(RawDesignerSequencePreview);

interface SequencePreviewContentProps {
  sequence: TaggedSequence | undefined;
  error: boolean;
  viewCeleryScript: boolean;
  viewSequenceCeleryScript: boolean;
  dispatch: Function;
  resources: ResourceIndex;
  descriptionCollapsed: boolean;
  variablesCollapsed: boolean;
  stepsCollapsed: boolean;
  licenseCollapsed: boolean;
  toggleSection(key: string): () => void;
  showToolbar?: boolean;
}

export const SequencePreviewContent = (props: SequencePreviewContentProps) => {
  const { sequence, viewSequenceCeleryScript } = props;
  return <EmptyStateWrapper
    notEmpty={sequence && isTaggedSequence(sequence)}
    graphic={EmptyStateGraphic.sequences}
    title={props.error ? t("Sequence load error") : t("Loading...")}>
    {sequence &&
      <div className={"sequence-preview-content"}>
        {props.showToolbar && props.viewCeleryScript &&
          <PreviewToolbar
            viewSequenceCeleryScript={viewSequenceCeleryScript}
            toggleViewCeleryScript={
              props.toggleSection("viewSequenceCeleryScript")} />}
        <div className={"sequence-editor-sections"}>
          <Description
            collapsed={props.descriptionCollapsed}
            sequence={sequence}
            toggle={props.toggleSection("descriptionCollapsed")} />
          {!viewSequenceCeleryScript &&
            <Variables
              collapsed={props.variablesCollapsed}
              sequence={sequence}
              resources={props.resources}
              toggle={props.toggleSection("variablesCollapsed")} />}
          {viewSequenceCeleryScript &&
            <pre>{stringifySequenceData(sequence.body)}</pre>}
          {!viewSequenceCeleryScript &&
            <Steps
              collapsed={props.stepsCollapsed}
              sequence={sequence}
              resources={props.resources}
              dispatch={props.dispatch}
              toggle={props.toggleSection("stepsCollapsed")} />}
          <License
            collapsed={props.licenseCollapsed}
            sequence={sequence}
            dispatch={noop}
            toggle={props.toggleSection("licenseCollapsed")} />
          <div className={"padding"} />
        </div>
      </div>}
  </EmptyStateWrapper>;
};

interface ImportBannerProps {
  sequence: TaggedSequence | undefined;
}

const ImportBanner = (props: ImportBannerProps) => {
  const [importing, setImporting] = React.useState(false);
  const { sequence } = props;
  return <div className={"import-banner"}>
    <label>{t("viewing a publicly shared sequence")}</label>
    <Help text={Content.IMPORT_SEQUENCE} />
    {sequence &&
      <button className={"transparent-button"}
        onClick={() => {
          installSequence(sequence.body.id)()
            .then(() => {
              push(`/app/designer/sequences/${urlFriendly(sequence.body.name)}`);
              setActiveSequenceByName();
            });
          publishAction(setImporting);
        }}>
        {importing ? t("importing") : t("import")}
        {importing && <i className={"fa fa-spinner fa-pulse"} />}
      </button>}
  </div>;
};

interface PreviewToolbarProps {
  viewSequenceCeleryScript: boolean;
  toggleViewCeleryScript(): void;
}

const PreviewToolbar = (props: PreviewToolbarProps) =>
  <div className={"preview-toolbar"}>
    <div className={"sequence-editor-tools preview"}>
      <div className={"button-group"}
        style={{ marginBottom: "0", marginTop: "0" }}>
        <i
          className={`fa fa-code ${props.viewSequenceCeleryScript
            ? "enabled"
            : ""} step-control`}
          title={t("toggle celery script view")}
          onClick={props.toggleViewCeleryScript} />
      </div>
    </div>
    <hr />
  </div>;

interface SectionBaseProps {
  collapsed: boolean;
  toggle(): void;
  sequence: TaggedSequence;
}

const Description = (props: SectionBaseProps) =>
  <div className={"preview-description"}>
    <SectionHeader title={t("Description")}
      collapsed={props.collapsed}
      toggle={props.toggle} />
    <Collapse isOpen={!props.collapsed}>
      <div className={"sequence-description"}>
        <Markdown>{props.sequence.body.description || ""}</Markdown>
      </div>
    </Collapse>
  </div>;

interface VariablesProps extends SectionBaseProps {
  resources: ResourceIndex;
}

const Variables = (props: VariablesProps) => {
  const variableData = createSequenceMeta(props.resources, props.sequence);
  return <div className={"preview-variables"}>
    <SectionHeader title={t("Variables")}
      collapsed={props.collapsed}
      count={Object.values(variableData).length}
      toggle={props.toggle} />
    <Collapse isOpen={!props.collapsed}>
      <ErrorBoundary>
        <LocalsList
          variableData={variableData}
          sequenceUuid={props.sequence.uuid}
          resources={props.resources}
          onChange={noop}
          allowedVariableNodes={AllowedVariableNodes.parameter} />
      </ErrorBoundary>
    </Collapse>
  </div>;
};

interface StepsProps extends SectionBaseProps {
  resources: ResourceIndex;
  dispatch: Function;
}

const Steps = (props: StepsProps) =>
  <div className={"preview-steps"}>
    <SectionHeader title={t("sequence steps")}
      collapsed={props.collapsed}
      count={(props.sequence.body.body || []).length}
      toggle={props.toggle} />
    <Collapse isOpen={!props.collapsed}>
      <div className="sequence" id="sequenceDiv">
        <div className={"sequence-step-components"}>
          <ErrorBoundary>
            <AllSteps
              sequence={props.sequence}
              onDrop={noop}
              dispatch={props.dispatch}
              readOnly={true}
              resources={props.resources} />
          </ErrorBoundary>
        </div>
      </div>
    </Collapse>
  </div>;

export interface LicenseProps extends SectionBaseProps {
  dispatch: Function;
}

export const License = (props: LicenseProps) => {
  const { sequence, dispatch } = props;
  return <div className={"license"}>
    <SectionHeader title={t("License")}
      collapsed={props.collapsed}
      toggle={props.toggle} />
    <Collapse isOpen={!props.collapsed}>
      <p>{"MIT License"}</p>
      <p>
        {"Copyright (c)"} {moment(sequence.body.created_at).year()}{" "}
        {isSequencePublished(sequence)
          ? <input defaultValue={sequence.body.copyright}
            onChange={e =>
              dispatch(edit(sequence, { copyright: e.currentTarget.value }))} />
          : sequence.body.copyright}
      </p>
      <p>{Content.MIT_LICENSE_PART_1}</p>
      <p>{Content.MIT_LICENSE_PART_2}</p>
      <p>{Content.MIT_LICENSE_PART_3}</p>
    </Collapse>
  </div>;
};
