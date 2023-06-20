import React from "react";
import { SequenceEditorMiddleProps } from "./interfaces";
import { isTaggedSequence } from "../resources/tagged_resources";
import { SequenceEditorMiddleActive } from "./sequence_editor_middle_active";
import {
  EmptyStateWrapper, EmptyStateGraphic,
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
        showName={true}
        dispatch={this.props.dispatch}
        sequence={sequence}
        sequences={this.props.sequences}
        resources={this.props.resources}
        syncStatus={this.props.syncStatus}
        hardwareFlags={this.props.hardwareFlags}
        farmwareData={this.props.farmwareData}
        getWebAppConfigValue={this.props.getWebAppConfigValue}
        sequencesState={this.props.sequencesState} />}
    </EmptyStateWrapper>;
  }
}
