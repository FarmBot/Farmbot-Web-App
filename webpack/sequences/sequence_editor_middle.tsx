import * as React from "react";
import { SequenceEditorMiddleProps } from "./interfaces";
import { isTaggedSequence } from "../resources/tagged_resources";
import { SequenceEditorMiddleInactive } from "./sequence_editor_middle_inactive";
import { SequenceEditorMiddleActive } from "./sequence_editor_middle_active";

export class SequenceEditorMiddle
  extends React.Component<SequenceEditorMiddleProps, {}> {
  render() {
    const {
      dispatch,
      sequence,
      resources,
      syncStatus,
      hardwareFlags,
      farmwareInfo,
      shouldDisplay,
    } = this.props;
    if (sequence && isTaggedSequence(sequence)) {
      return <SequenceEditorMiddleActive
        dispatch={dispatch}
        sequence={sequence}
        resources={resources}
        syncStatus={syncStatus}
        hardwareFlags={hardwareFlags}
        farmwareInfo={farmwareInfo}
        shouldDisplay={shouldDisplay} />;
    } else {
      return <SequenceEditorMiddleInactive />;
    }
  }
}
