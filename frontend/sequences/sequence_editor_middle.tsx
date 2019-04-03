import * as React from "react";
import { SequenceEditorMiddleProps } from "./interfaces";
import { isTaggedSequence } from "../resources/tagged_resources";
import { SequenceEditorMiddleActive } from "./sequence_editor_middle_active";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../ui/empty_state_wrapper";
import { Content } from "../constants";
import { t } from "../i18next_wrapper";

export class SequenceEditorMiddle
  extends React.Component<SequenceEditorMiddleProps, {}> {
  render() {
    const { sequence } = this.props;
    return <EmptyStateWrapper
      notEmpty={sequence && isTaggedSequence(sequence)}
      graphic={EmptyStateGraphic.sequences}
      title={t("No Sequence selected.")}
      text={Content.NO_SEQUENCE_SELECTED}>
      {sequence && <SequenceEditorMiddleActive
        dispatch={this.props.dispatch}
        sequence={sequence}
        resources={this.props.resources}
        syncStatus={this.props.syncStatus}
        hardwareFlags={this.props.hardwareFlags}
        farmwareInfo={this.props.farmwareInfo}
        shouldDisplay={this.props.shouldDisplay}
        confirmStepDeletion={this.props.confirmStepDeletion}
        menuOpen={this.props.menuOpen} />}
    </EmptyStateWrapper>;
  }
}
