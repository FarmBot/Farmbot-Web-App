import * as React from "react";
import { SequenceEditorMiddleProps } from "./interfaces";
import { isTaggedSequence } from "../resources/tagged_resources";
import { SequenceEditorMiddleInactive } from "./sequence_editor_middle_inactive";
import { SequenceEditorMiddleActive } from "./sequence_editor_middle_active";

export class SequenceEditorMiddle
  extends React.Component<SequenceEditorMiddleProps, {}> {
  render() {
    let {
      dispatch,
      sequence,
      sequences,
      tools,
      slots,
      resources
    } = this.props;
    if (sequence && isTaggedSequence(sequence)) {
      return <SequenceEditorMiddleActive
        slots={slots}
        dispatch={dispatch}
        sequence={sequence}
        sequences={sequences}
        tools={tools}
        resources={resources} />;
    } else {
      return <SequenceEditorMiddleInactive />;
    }
  }
}
