import * as React from "react";
import { connect } from "react-redux";
import { SequencesList } from "./sequences_list";
import { StepButtonCluster } from "./step_button_cluster";
import { SequenceEditorMiddle } from "./sequence_editor_middle";
import { Page, Row } from "../ui/index";
import { Props } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { ToolTips } from "../constants";
import { isTaggedSequence } from "../resources/tagged_resources";
import { setActiveSequenceByName } from "./set_active_sequence_by_name";
import { LeftPanel, CenterPanel, RightPanel } from "../ui";
import { resourceUsageList } from "../resources/in_use";
import { t } from "../i18next_wrapper";
import { unselectSequence } from "./actions";
import { isNumber } from "lodash";

const SequenceBackButton = (props: { dispatch: Function, className: string }) =>
  <Row>
    <button
      className={`back-to-sequences fb-button gray ${props.className}`}
      onClick={() => props.dispatch(unselectSequence())}>
      <i className="fa fa-arrow-left" />
      {t("back to sequences")}
    </button>
  </Row>;

@connect(mapStateToProps)
export class Sequences extends React.Component<Props, {}> {
  componentWillMount() {
    if (!this.props.sequence) { setActiveSequenceByName(); }
  }

  render() {
    const { sequence } = this.props;
    const sequenceSelected = sequence && isTaggedSequence(sequence);
    const sequenceOpen = sequenceSelected ? "open" : "";
    const insertingStep = isNumber(this.props.stepIndex) ? "inserting-step" : "";
    const activeClasses = [sequenceOpen, insertingStep].join(" ");
    return <Page className="sequence-page">
      <SequenceBackButton className={activeClasses} dispatch={this.props.dispatch} />
      <Row>
        <LeftPanel
          className={`sequence-list-panel ${activeClasses}`}
          title={t("Sequences")}
          helpText={t(ToolTips.SEQUENCE_LIST)}>
          <SequencesList
            resourceUsage={resourceUsageList(this.props.resources.inUse)}
            sequenceMetas={this.props.resources.sequenceMetas}
            dispatch={this.props.dispatch}
            sequence={this.props.sequence}
            sequences={this.props.sequences} />
        </LeftPanel>
        <CenterPanel
          className={`sequence-editor-panel ${activeClasses}`}
          title={t("Sequence Editor")}
          helpText={t(ToolTips.SEQUENCE_EDITOR)}>
          <SequenceEditorMiddle
            syncStatus={this.props.syncStatus}
            dispatch={this.props.dispatch}
            sequence={this.props.sequence}
            resources={this.props.resources}
            hardwareFlags={this.props.hardwareFlags}
            farmwareInfo={this.props.farmwareInfo}
            shouldDisplay={this.props.shouldDisplay}
            confirmStepDeletion={this.props.confirmStepDeletion}
            menuOpen={this.props.menuOpen} />
        </CenterPanel>
        <RightPanel
          className={`step-button-cluster-panel ${activeClasses}`}
          title={t("Commands")}
          helpText={t(ToolTips.SEQUENCE_COMMANDS)}
          show={sequenceSelected}>
          <StepButtonCluster
            current={this.props.sequence}
            dispatch={this.props.dispatch}
            shouldDisplay={this.props.shouldDisplay}
            stepIndex={this.props.stepIndex} />
        </RightPanel>
      </Row>
    </Page>;
  }
}
