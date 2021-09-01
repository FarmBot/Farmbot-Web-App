import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { t } from "../../i18next_wrapper";
import { EmptyStateWrapper, EmptyStateGraphic, Help } from "../../ui";
import { isTaggedSequence } from "../../resources/tagged_resources";
import { ResourceTitle } from "./editor";
import { Everything } from "../../interfaces";
import { SpecialStatus, TaggedSequence } from "farmbot";
import axios from "axios";
import { API } from "../../api";
import { getPathArray } from "../../history";
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
  error: boolean;
}

export class RawDesignerSequencePreview
  extends React.Component<SequencePreviewProps, SequencePreviewState> {
  state: SequencePreviewState = {
    sequence: undefined,
    viewSequenceCeleryScript: false,
    error: false,
  };

  componentDidMount = () => {
    const id = getPathArray()[4];
    axios.get(API.current.sequenceVersionsPath + id)
      .then(response => {
        const sequence: TaggedSequence = {
          kind: "Sequence",
          uuid: "Sequence.0",
          specialStatus: SpecialStatus.SAVED,
          body: response.data,
        };
        sequence.body.name = `Shared Sequence ${id}`;
        sequence.body.body?.map(step => maybeTagStep(step));
        this.setState({ sequence });
      }, () => {
        this.setState({ error: true });
      });
  }

  toggleViewRaw = () => this.setState({
    viewSequenceCeleryScript: !this.state.viewSequenceCeleryScript
  });

  render() {
    const panelName = "designer-sequence-editor";
    const { sequence, viewSequenceCeleryScript } = this.state;
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
        <div className={"import-banner"}>
          <label>{t("viewing a publicly shared sequence")}</label>
          <Help text={Content.IMPORT_SEQUENCE} />
          {sequence &&
            <button className={"transparent-button"}
              onClick={installSequence(sequence.body.id)}>
              {t("import")}
            </button>}
        </div>
        <EmptyStateWrapper
          notEmpty={sequence && isTaggedSequence(sequence)}
          graphic={EmptyStateGraphic.sequences}
          title={this.state.error ? t("Sequence load error") : t("Loading...")}>
          {sequence &&
            <div className={"sequence-editor-content"}>
              <div className={"sequence-editor-tools preview"}>
                <div className={"button-group"}
                  style={{ marginBottom: "0", marginTop: "0" }}>
                  {this.props.getWebAppConfigValue(
                    BooleanSetting.view_celery_script) &&
                    <i
                      className={`fa fa-code ${viewSequenceCeleryScript
                        ? "enabled"
                        : ""} step-control`}
                      title={t("toggle celery script view")}
                      onClick={this.toggleViewRaw} />}
                </div>
                {!viewSequenceCeleryScript &&
                  <ErrorBoundary>
                    <LocalsList
                      variableData={createSequenceMeta(
                        this.props.resources, sequence)}
                      sequenceUuid={sequence.uuid}
                      resources={this.props.resources}
                      onChange={noop}
                      allowedVariableNodes={AllowedVariableNodes.parameter} />
                  </ErrorBoundary>}
              </div>
              {!viewSequenceCeleryScript && <hr />}
              <div className={"sequence preview"}
                style={{
                  height: `calc(100vh - ${viewSequenceCeleryScript ? 22 : 25}rem)`
                }}>
                {viewSequenceCeleryScript
                  ? <pre>{stringifySequenceData(sequence.body)}</pre>
                  : <div className={"sequence-step-components"}>
                    <ErrorBoundary>
                      <AllSteps
                        sequence={sequence}
                        onDrop={noop}
                        dispatch={this.props.dispatch}
                        readOnly={true}
                        resources={this.props.resources} />
                    </ErrorBoundary>
                    <div className={"padding"}></div>
                  </div>}
              </div>
            </div>}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSequencePreview =
  connect(mapStateToProps)(RawDesignerSequencePreview);
