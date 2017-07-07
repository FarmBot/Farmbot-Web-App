import * as React from "react";
import { BulkSchedulerWidget } from "./bulk_scheduler/index";
import { RegimensList } from "./list/index";
import { RegimenEditorWidget } from "./editor/index";
import { connect } from "react-redux";
import { isMobile } from "../util";
import { MobileRegimensNav } from "./mobile_nav";
import { Props } from "./interfaces";
import { Page, Row, Col } from "../ui/index";
import { mapStateToProps } from "./state_to_props";

@connect(mapStateToProps)
export class Regimens extends React.Component<Props, {}> {
  render() {
    return <Page className="regimens">
      <Row>
        <Col xs={12} md={3}>
          <BulkSchedulerWidget
            selectedSequence={this.props.selectedSequence}
            dailyOffsetMs={this.props.dailyOffsetMs}
            weeks={this.props.weeks}
            sequences={this.props.sequences}
            resources={this.props.resources}
            dispatch={this.props.dispatch}
          />
        </Col>
        <Col xs={12} md={6}>
          <RegimenEditorWidget
            dispatch={this.props.dispatch}
            auth={this.props.auth}
            bot={this.props.bot}
            calendar={this.props.calendar}
            current={this.props.current}
          />
        </Col>
        {isMobile() && <MobileRegimensNav />}
        <Col xs={12} md={3}>
          <RegimensList
            dispatch={this.props.dispatch}
            regimens={this.props.regimens}
            regimen={this.props.current}
          />
        </Col>
      </Row>
    </Page>;
  }
}
