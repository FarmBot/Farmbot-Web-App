import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { Everything } from "../../interfaces";
import { Farmwares } from "../interfaces";
import { t } from "../../i18next_wrapper";
import { SearchField } from "../../ui/search_field";
import { EmptyStateWrapper, EmptyStateGraphic } from "../../ui";
import { Content, Actions } from "../../constants";
import { generateFarmwareDictionary } from "../state_to_props";
import { Link } from "../../link";
import { farmwareUrlFriendly } from "../set_active_farmware_by_name";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";
import { Path } from "../../internal_urls";

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

  render() {
    const farmwareNames = Object.values(this.props.farmwares)
      .map(fw => fw.name)
      .filter(farmwareName => farmwareName != FarmwareName.MeasureSoilHeight)
      .filter(fwName => !this.props.firstPartyFarmwareNames.includes(fwName));
    const panelName = "designer-farmware-list";
    return <DesignerPanel panelName={panelName} panel={Panel.Farmware}>
      <DesignerPanelTop
        panel={Panel.Farmware}
        linkTo={Path.farmware("add")}
        title={t("Install Farmware")}>
        <SearchField nameKey={"farmware"}
          searchTerm={this.state.searchTerm}
          placeholder={t("Search your Farmware...")}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={panelName}>
        <EmptyStateWrapper
          notEmpty={farmwareNames.length > 0}
          graphic={EmptyStateGraphic.sequences}
          title={t("No Farmware yet.")}
          text={Content.NO_FARMWARE}
          colorScheme={"farmware"}>
          {farmwareNames
            .filter(f =>
              f.toLowerCase().includes(this.state.searchTerm.toLowerCase()))
            .map(f =>
              <FarmwareListItem
                key={f}
                dispatch={this.props.dispatch}
                farmwareName={f} />)}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerFarmwareList =
  connect(mapStateToProps)(RawDesignerFarmwareList);
// eslint-disable-next-line import/no-default-export
export default DesignerFarmwareList;

export interface FarmwareListItemProps {
  dispatch: Function;
  farmwareName: string;
}

/** Farmware list links: selected or unselected. */
export const FarmwareListItem = (props: FarmwareListItemProps) => {
  const { dispatch, farmwareName } = props;
  const click = () => dispatch({
    type: Actions.SELECT_FARMWARE,
    payload: farmwareName
  });
  return <Link
    to={Path.farmware(farmwareUrlFriendly(farmwareName))}
    key={farmwareName}
    onClick={click}>
    <div className={"farmware-list-items"}>
      <p>{farmwareName}</p>
    </div>
  </Link>;
};
