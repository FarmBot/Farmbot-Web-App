import * as React from "react";
import { t } from "i18next";
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

@connect(mapStateToProps)
export class Sequences extends React.Component<Props, {}> {
  componentWillMount() {
    if (!this.props.sequence) { setActiveSequenceByName(); }
  }

  render() {
    const { sequence } = this.props;
    const sequenceSelected = sequence && isTaggedSequence(sequence);
    return <Page className="Sequence">
      <Row>
        <LeftPanel
          className="sequence-list-panel"
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
          className="sequence-editor-panel"
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
            confirmStepDeletion={this.props.confirmStepDeletion} />
        </CenterPanel>
        <RightPanel
          className="step-button-cluster-panel"
          title={t("Commands")}
          helpText={t(ToolTips.SEQUENCE_COMMANDS)}
          show={sequenceSelected}>
          <StepButtonCluster
            current={this.props.sequence}
            dispatch={this.props.dispatch}
            shouldDisplay={this.props.shouldDisplay} />
        </RightPanel>
      </Row>
    </Page>;
  }
}
