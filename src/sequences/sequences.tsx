import * as React from "react";
import { connect } from "react-redux";
import { SequencesList } from "./sequences_list";
import { StepButtonCluster } from "./step_button_cluster";
import { SequenceEditorMiddle } from "./sequence_editor_middle";
import { MobileSequencesNav } from "./mobile_nav";
import { isMobile } from "../util";
import { Page, Col } from "../ui/index";
import { Props } from "./interfaces";
import { mapStateToProps } from "./state_to_props";

@connect(mapStateToProps)
export class Sequences extends React.Component<Props, {}> {
  render() {
    return <Page className="sequences">
      <Col sm={3}>
        <StepButtonCluster
          current={this.props.sequence}
          dispatch={this.props.dispatch} />
      </Col>
      <Col sm={6}>
        <SequenceEditorMiddle
          dispatch={this.props.dispatch}
          sequences={this.props.sequences}
          sequence={this.props.sequence}
          slots={this.props.slots}
          tools={this.props.tools}
          resources={this.props.resources}
        />
      </Col>
      {isMobile() && <MobileSequencesNav />}
      <Col sm={3}>
        <SequencesList
          dispatch={this.props.dispatch}
          auth={this.props.auth}
          sequence={this.props.sequence}
          sequences={this.props.sequences}
        />
      </Col>
    </Page>;
  }
};
