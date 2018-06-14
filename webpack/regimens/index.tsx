import * as React from "react";
import { BulkScheduler } from "./bulk_scheduler/index";
import { RegimensList } from "./list/index";
import { RegimenEditor } from "./editor/index";
import { connect } from "react-redux";
import { Props } from "./interfaces";
import { Page, Row, LeftPanel, CenterPanel, RightPanel } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { isTaggedRegimen } from "../resources/tagged_resources";
import { setActiveRegimenByName } from "./set_active_regimen_by_name";
import { t } from "i18next";
import { ToolTips } from "../constants";

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
        <LeftPanel
          className="regimen-list-panel"
          title={t("Regimens")}
          helpText={t(ToolTips.REGIMEN_LIST)}>
          <RegimensList
            dispatch={this.props.dispatch}
            regimens={this.props.regimens}
            regimen={this.props.current} />
        </LeftPanel>
        <CenterPanel
          className="regimen-editor-panel"
          title={t("Regimen Editor")}
          helpText={t(ToolTips.REGIMEN_EDITOR)}
          width={5}>
          <RegimenEditor
            dispatch={this.props.dispatch}
            calendar={this.props.calendar}
            current={this.props.current} />
        </CenterPanel>
        <RightPanel
          className="bulk-scheduler"
          title={t("Scheduler")}
          helpText={t(ToolTips.BULK_SCHEDULER)}
          show={!!regimenSelected} width={4}>
          <BulkScheduler
            selectedSequence={this.props.selectedSequence}
            dailyOffsetMs={this.props.dailyOffsetMs}
            weeks={this.props.weeks}
            sequences={this.props.sequences}
            resources={this.props.resources}
            dispatch={this.props.dispatch} />
        </RightPanel>
      </Row>
    </Page>;
  }
}
