import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../designer_panel";
import { DesignerNavTabs, Panel } from "../panel_header";
import { Everything } from "../../interfaces";
import { Farmwares } from "../../farmware/interfaces";
import { t } from "../../i18next_wrapper";
import { farmwareListItem } from "../../farmware/farmware_list";
import { SearchField } from "../../ui/search_field";
import { EmptyStateWrapper, EmptyStateGraphic } from "../../ui";
import { Content } from "../../constants";
import { generateFarmwareDictionary } from "../../farmware/state_to_props";

export interface DesignerFarmwareListProps {
  dispatch: Function;
  farmwares: Farmwares;
  currentFarmware: string | undefined;
  firstPartyFarmwareNames: string[];
}

interface FarmwareListState {
  searchTerm: string;
}

export const mapStateToProps =
  (props: Everything): DesignerFarmwareListProps => {
    const { currentFarmware, firstPartyFarmwareNames } =
      props.resources.consumers.farmware;
    return {
      currentFarmware,
      farmwares: generateFarmwareDictionary(props.bot, props.resources.index),
      dispatch: props.dispatch,
      firstPartyFarmwareNames,
    };
  };

export class RawDesignerFarmwareList
  extends React.Component<DesignerFarmwareListProps, FarmwareListState> {
  state: FarmwareListState = { searchTerm: "" };

  get current() { return this.props.currentFarmware; }

  render() {
    const farmwareNames = Object.values(this.props.farmwares)
      .map(fw => fw.name)
      .filter(fwName => !this.props.firstPartyFarmwareNames.includes(fwName));
    const panelName = "designer-farmware-list";
    return <DesignerPanel panelName={panelName} panel={Panel.Farmware}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Farmware}
        linkTo={"/app/designer/farmware/add"}
        title={t("Install Farmware")}>
        <SearchField searchTerm={this.state.searchTerm}
          placeholder={t("Search your Farmware...")}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={panelName}>
        <EmptyStateWrapper
          notEmpty={Object.values(this.props.farmwares).length > 0}
          graphic={EmptyStateGraphic.sequences}
          title={t("No Farmware yet.")}
          text={Content.NO_FARMWARE}
          colorScheme={"farmware"}>
          {farmwareNames
            .filter(f =>
              f.toLowerCase().includes(this.state.searchTerm.toLowerCase()))
            .map(farmwareListItem(this.props.dispatch, this.current))}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerFarmwareList =
  connect(mapStateToProps)(RawDesignerFarmwareList);
