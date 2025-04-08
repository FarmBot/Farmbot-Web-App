import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { RegimensListProps, RegimensListState } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { SearchField } from "../../ui/search_field";
import { addRegimen } from "../list/add_regimen";
import { EmptyStateWrapper, EmptyStateGraphic } from "../../ui";
import { Content } from "../../constants";
import { sortResourcesById } from "../../util";
import { RegimenListItem } from "../list/regimen_list_item";
import { Everything } from "../../interfaces";
import { selectAllRegimens } from "../../resources/selectors";
import { resourceUsageList } from "../../resources/in_use";
import { NavigationContext } from "../../routes_helpers";

export const mapStateToProps = (props: Everything): RegimensListProps => ({
  dispatch: props.dispatch,
  regimens: selectAllRegimens(props.resources.index),
  regimenUsageStats: resourceUsageList(props.resources.index.inUse),
});

export class RawDesignerRegimenList
  extends React.Component<RegimensListProps, RegimensListState> {
  state: RegimensListState = { searchTerm: "" };

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  render() {
    const panelName = "designer-regimen-list";
    return <DesignerPanel panelName={panelName} panel={Panel.Regimens}>
      <DesignerPanelTop
        panel={Panel.Regimens}
        onClick={() => this.props.dispatch(
          addRegimen(this.props.regimens.length, this.navigate))}
        title={t("add new regimen")}>
        <SearchField nameKey={"regimens"}
          searchTerm={this.state.searchTerm}
          placeholder={t("Search your regimens...")}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={panelName}>
        <EmptyStateWrapper
          notEmpty={this.props.regimens.length > 0}
          graphic={EmptyStateGraphic.regimens}
          title={t("No Regimens.")}
          text={Content.NO_REGIMENS}>
          {sortResourcesById(this.props.regimens)
            .filter(regimen => regimen.body.name.toLowerCase()
              .includes(this.state.searchTerm.toLowerCase()))
            .map((regimen, index) =>
              <RegimenListItem
                key={index}
                inUse={!!this.props.regimenUsageStats[regimen.uuid]}
                regimen={regimen}
                dispatch={this.props.dispatch} />)}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerRegimenList =
  connect(mapStateToProps)(RawDesignerRegimenList);
// eslint-disable-next-line import/no-default-export
export default DesignerRegimenList;
