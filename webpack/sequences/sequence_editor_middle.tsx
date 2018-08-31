import * as React from "react";
import { SequenceEditorMiddleProps } from "./interfaces";
import { isTaggedSequence } from "../resources/tagged_resources";
import { SequenceEditorMiddleInactive } from "./sequence_editor_middle_inactive";
import { SequenceEditorMiddleActive } from "./sequence_editor_middle_active";

export class SequenceEditorMiddle
  extends React.Component<SequenceEditorMiddleProps, {}> {
  render() {
    const { sequence } = this.props;
    if (sequence && isTaggedSequence(sequence)) {
      return <SequenceEditorMiddleActive
        dispatch={this.props.dispatch}
        sequence={sequence}
        resources={this.props.resources}
        syncStatus={this.props.syncStatus}
        hardwareFlags={this.props.hardwareFlags}
        farmwareInfo={this.props.farmwareInfo}
        shouldDisplay={this.props.shouldDisplay}
        confirmStepDeletion={this.props.confirmStepDeletion} />;
    } else {
      return <SequenceEditorMiddleInactive />;
    }
  }
}
