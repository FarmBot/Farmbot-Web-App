import * as React from "react";
import { BulkSchedulerWidget } from "./bulk_scheduler/index";
import { RegimensList } from "./list/index";
import { RegimenEditorWidget } from "./editor/index";
import { connect } from "react-redux";
import { Props } from "./interfaces";
import { Page, Row, Col } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { isTaggedRegimen } from "../resources/tagged_resources";
import { setActiveRegimenByName } from "./set_active_regimen_by_name";

@connect(mapStateToProps)
export class Regimens extends React.Component<Props, {}> {
  componentWillMount() {
    if (!this.props.current) { setActiveRegimenByName(); }
  }

  render() {
    const { current, calendar } = this.props;
    const regimenSelected = current && isTaggedRegimen(current) && calendar;
    return <Page className="Regimen">
      <Row>
        <Col sm={3}>
          <RegimensList
            dispatch={this.props.dispatch}
            regimens={this.props.regimens}
            regimen={this.props.current} />
        </Col>
        <Col sm={5}>
          <RegimenEditorWidget
            dispatch={this.props.dispatch}
            auth={this.props.auth}
            bot={this.props.bot}
            calendar={this.props.calendar}
            current={this.props.current} />
        </Col>
        <Col sm={4}>
          {regimenSelected &&
            <BulkSchedulerWidget
              selectedSequence={this.props.selectedSequence}
              dailyOffsetMs={this.props.dailyOffsetMs}
              weeks={this.props.weeks}
              sequences={this.props.sequences}
              resources={this.props.resources}
              dispatch={this.props.dispatch} />}
        </Col>
      </Row>
    </Page>;
  }
}
