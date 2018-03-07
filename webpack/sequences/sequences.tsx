import * as React from "react";
import { t } from "i18next";
import { connect } from "react-redux";
import { SequencesList } from "./sequences_list";
import { StepButtonCluster } from "./step_button_cluster";
import { SequenceEditorMiddle } from "./sequence_editor_middle";
import { Page, Col, ToolTip, Row } from "../ui/index";
import { Props } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { ToolTips } from "../constants";
import { isTaggedSequence } from "../resources/tagged_resources";
import { catchErrors } from "../util";

@connect(mapStateToProps)
export class Sequences extends React.Component<Props, {}> {
  componentDidCatch(x: Error, y: React.ErrorInfo) { catchErrors(x, y); }

  render() {
    const { sequence } = this.props;
    const sequenceSelected = sequence && isTaggedSequence(sequence);
    return <Page className="Sequence">
      <Row>
        <Col sm={3}>
          <SequencesList
            dispatch={this.props.dispatch}
            auth={this.props.auth}
            sequence={this.props.sequence}
            sequences={this.props.sequences} />
        </Col>
        <Col sm={6}>
          <div className="sequence-editor-panel">
            <h3>
              <i>{t("Sequence Editor")}</i>
            </h3>
            <ToolTip helpText={t(ToolTips.SEQUENCE_EDITOR)} />
            <SequenceEditorMiddle
              syncStatus={this.props.syncStatus}
              dispatch={this.props.dispatch}
              sequence={this.props.sequence}
              resources={this.props.resources}
              consistent={this.props.consistent}
              autoSyncEnabled={this.props.autoSyncEnabled}
              hardwareFlags={this.props.hardwareFlags}
              farmwareInfo={this.props.farmwareInfo}
              installedOsVersion={this.props.installedOsVersion} />
          </div>
        </Col>
        <Col sm={3}>
          {sequenceSelected &&
            <StepButtonCluster
              current={this.props.sequence}
              dispatch={this.props.dispatch} />}
        </Col>
      </Row>
    </Page>;
  }
}
