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
import { t } from "../i18next_wrapper";
import { ToolTips, Actions } from "../constants";
import { unselectRegimen } from "./actions";

export interface RegimenBackButtonProps {
  dispatch: Function;
  className: string;
}

export const RegimenBackButton = (props: RegimenBackButtonProps) => {
  const schedulerOpen = props.className.includes("inserting-item");
  return <i
    className={`back-to-regimens fa fa-arrow-left ${props.className}`}
    onClick={() => schedulerOpen
      ? props.dispatch({ type: Actions.SET_SCHEDULER_STATE, payload: false })
      : props.dispatch(unselectRegimen())}
    title={schedulerOpen ? t("back to regimen") : t("back to regimens")} />;
};

export class RawRegimens extends React.Component<Props, {}> {
  UNSAFE_componentWillMount() {
    if (!this.props.current) { setActiveRegimenByName(); }
  }

  render() {
    const { current, calendar } = this.props;
    const regimenSelected = current && isTaggedRegimen(current) && calendar;
    const regimenOpen = regimenSelected ? "open" : "";
    const insertingItem = this.props.schedulerOpen ? "inserting-item" : "";
    const activeClasses = [regimenOpen, insertingItem].join(" ");
    return <Page className="regimen-page">
      <Row>
        <LeftPanel
          className={`regimen-list-panel ${activeClasses}`}
          title={t("Regimens")}>
          <RegimensList
            usageStats={this.props.regimenUsageStats}
            dispatch={this.props.dispatch}
            regimens={this.props.regimens}
            regimen={this.props.current} />
        </LeftPanel>
        <CenterPanel
          className={`regimen-editor-panel ${activeClasses}`}
          backButton={<RegimenBackButton
            className={activeClasses}
            dispatch={this.props.dispatch} />}
          title={regimenOpen ? t("Edit Regimen") : t("Regimen Editor")}
          helpText={t(ToolTips.REGIMEN_EDITOR)}
          width={5}>
          <RegimenEditor
            dispatch={this.props.dispatch}
            calendar={this.props.calendar}
            current={this.props.current}
            resources={this.props.resources}
            variableData={this.props.variableData}
            shouldDisplay={this.props.shouldDisplay} />
        </CenterPanel>
        <RightPanel
          className={`bulk-scheduler ${activeClasses}`}
          backButton={<RegimenBackButton
            className={activeClasses}
            dispatch={this.props.dispatch} />}
          title={insertingItem ? t("Add Regimen Item") : t("Scheduler")}
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
export const Regimens = connect(mapStateToProps)(RawRegimens);
