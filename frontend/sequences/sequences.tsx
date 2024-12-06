import React from "react";
import { connect } from "react-redux";
import { StepButtonCluster } from "./step_button_cluster";
import { SequenceEditorMiddle } from "./sequence_editor_middle";
import { Page, Row } from "../ui";
import { SequencesProps } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { isTaggedSequence } from "../resources/tagged_resources";
import { setActiveSequenceByName } from "./set_active_sequence_by_name";
import { t } from "../i18next_wrapper";
import { unselectSequence, closeCommandMenu } from "./actions";
import { isNumber, noop } from "lodash";
import { RawDesignerSequenceList } from "./panel/list";
import { Path } from "../internal_urls";
import { urlFriendly } from "../util";
import { ErrorBoundary } from "../error_boundary";
import { isMobile } from "../screen_size";
import { Navigate, useNavigate } from "react-router";

export interface SequenceBackButtonProps {
  dispatch: Function;
  className: string;
}

export const SequenceBackButton = (props: SequenceBackButtonProps) => {
  const insertingStep = props.className.includes("inserting-step");
  const navigate = useNavigate();
  return <i
    className={`back-to-sequences fa fa-arrow-left ${props.className}`}
    onClick={() => props.dispatch(
      insertingStep ? closeCommandMenu() : unselectSequence(navigate))}
    title={insertingStep ? t("back to sequence") : t("back to sequences")} />;
};

export class RawSequences extends React.Component<SequencesProps, {}> {
  componentDidMount() {
    if (!this.props.sequence) { setActiveSequenceByName(); }
  }

  render() {
    const { sequence, sequencesState } = this.props;
    const { stepIndex } = sequencesState;
    const sequenceSelected = sequence && isTaggedSequence(sequence);
    const sequenceOpen = sequenceSelected ? "open" : "";
    const insertingStep = isNumber(stepIndex) ? "inserting-step" : "";
    const activeClasses = [sequenceOpen, insertingStep].join(" ");
    const path = Path.designerSequences(sequenceSelected
      ? urlFriendly(sequence.body.name)
      : undefined);
    return <Page className="sequence-page">
      {isMobile() && !Path.inDesigner() && <Navigate to={path} />}
      <Row className="sequences-page-grid">
        <div className={`sequence-list-panel ${activeClasses}`}>
          <ErrorBoundary>
            <RawDesignerSequenceList {...this.props} />
          </ErrorBoundary>
        </div>
        <div className={`sequence-editor-panel ${activeClasses}`}>
          <ErrorBoundary>
            <SequenceEditorMiddle
              syncStatus={this.props.syncStatus}
              dispatch={this.props.dispatch}
              sequence={this.props.sequence}
              sequences={this.props.sequences}
              resources={this.props.resources}
              hardwareFlags={this.props.hardwareFlags}
              farmwareData={this.props.farmwareData}
              getWebAppConfigValue={this.props.getWebAppConfigValue}
              sequencesState={sequencesState} />
          </ErrorBoundary>
        </div>
        {sequenceSelected &&
          <div className={`step-button-cluster-panel ${activeClasses}`}>
            <ErrorBoundary>
              <StepButtonCluster
                close={noop}
                current={this.props.sequence}
                dispatch={this.props.dispatch}
                farmwareData={this.props.farmwareData}
                sequences={this.props.sequences}
                resources={this.props.resources}
                stepIndex={stepIndex} />
            </ErrorBoundary>
          </div>}
      </Row>
    </Page>;
  }
}

export const Sequences = connect(mapStateToProps)(RawSequences);
// eslint-disable-next-line import/no-default-export
export default Sequences;
