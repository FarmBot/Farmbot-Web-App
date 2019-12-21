import * as React from "react";
import { connect } from "react-redux";
import { StepButtonCluster } from "./step_button_cluster";
import { SequenceEditorMiddle } from "./sequence_editor_middle";
import { Page, Row, LeftPanel } from "../ui";
import { Props } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { ToolTips } from "../constants";
import { isTaggedSequence } from "../resources/tagged_resources";
import { setActiveSequenceByName } from "./set_active_sequence_by_name";
import { CenterPanel, RightPanel } from "../ui";
import { t } from "../i18next_wrapper";
import { unselectSequence, closeCommandMenu } from "./actions";
import { isNumber } from "lodash";
import { Folders } from "../folders/component";

export interface SequenceBackButtonProps {
  dispatch: Function;
  className: string;
}

export const SequenceBackButton = (props: SequenceBackButtonProps) => {
  const insertingStep = props.className.includes("inserting-step");
  return <i
    className={`back-to-sequences fa fa-arrow-left ${props.className}`}
    onClick={() => props.dispatch(
      insertingStep ? closeCommandMenu() : unselectSequence())}
    title={insertingStep ? t("back to sequence") : t("back to sequences")} />;
};

export class RawSequences extends React.Component<Props, {}> {
  UNSAFE_componentWillMount() {
    if (!this.props.sequence) { setActiveSequenceByName(); }
  }

  render() {
    const { sequence } = this.props;
    const sequenceSelected = sequence && isTaggedSequence(sequence);
    const sequenceOpen = sequenceSelected ? "open" : "";
    const insertingStep = isNumber(this.props.stepIndex) ? "inserting-step" : "";
    const activeClasses = [sequenceOpen, insertingStep].join(" ");
    return <Page className="sequence-page">
      <Row>
        <LeftPanel
          className={`sequence-list-panel ${activeClasses}`}
          title={t("Sequences")}>
          <Folders {...this.props.folderData} dispatch={this.props.dispatch} />
        </LeftPanel>
        <CenterPanel
          className={`sequence-editor-panel ${activeClasses}`}
          backButton={<SequenceBackButton
            className={activeClasses}
            dispatch={this.props.dispatch} />}
          title={sequenceOpen ? t("Edit Sequence") : t("Sequence Editor")}
          helpText={t(ToolTips.SEQUENCE_EDITOR)}>
          <SequenceEditorMiddle
            syncStatus={this.props.syncStatus}
            dispatch={this.props.dispatch}
            sequence={this.props.sequence}
            resources={this.props.resources}
            hardwareFlags={this.props.hardwareFlags}
            farmwareInfo={this.props.farmwareInfo}
            shouldDisplay={this.props.shouldDisplay}
            getWebAppConfigValue={this.props.getWebAppConfigValue}
            menuOpen={this.props.menuOpen} />
        </CenterPanel>
        <RightPanel
          className={`step-button-cluster-panel ${activeClasses}`}
          backButton={<SequenceBackButton
            className={activeClasses}
            dispatch={this.props.dispatch} />}
          title={insertingStep ? t("Add Command") : t("Commands")}
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

export const Sequences = connect(mapStateToProps)(RawSequences);
