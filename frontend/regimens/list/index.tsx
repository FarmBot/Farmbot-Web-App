import * as React from "react";
import { RegimenListItem } from "./regimen_list_item";
import { AddRegimen } from "./add_button";
import { Row, Col } from "../../ui/index";
import { RegimensListProps, RegimensListState } from "../interfaces";
import { sortResourcesById } from "../../util";
import { t } from "../../i18next_wrapper";
import { EmptyStateWrapper, EmptyStateGraphic } from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import { SearchField } from "../../ui/search_field";

interface RegimenListHeaderProps {
  searchTerm: string;
  onChange(searchTerm: string): void;
  regimenCount: number;
  dispatch: Function;
}

const RegimenListHeader = (props: RegimenListHeaderProps) =>
  <div className={"panel-top with-button"}>
    <SearchField
      placeholder={t("Search regimens...")}
      searchTerm={props.searchTerm}
      onChange={props.onChange} />
    <AddRegimen dispatch={props.dispatch} length={props.regimenCount} />
  </div>;

export class RegimensList extends
  React.Component<RegimensListProps, RegimensListState> {

  state: RegimensListState = {
    searchTerm: ""
  };

  rows = () => {
    const searchTerm = this.state.searchTerm.toLowerCase();
    return <Col xs={12}>
      {sortResourcesById(this.props.regimens)
        .filter(regimen => regimen
          .body
          .name
          .toLowerCase()
          .includes(searchTerm))
        .map((regimen, index) => {
          return <RegimenListItem
            index={index}
            key={index}
            inUse={!!this.props.usageStats[regimen.uuid]}
            regimen={regimen}
            dispatch={this.props.dispatch}
            length={this.props.regimens.length} />;
        })}
    </Col>;
  }

  render() {
    return <div className={"regimens-list-wrapper"}>
      <RegimenListHeader
        dispatch={this.props.dispatch}
        regimenCount={this.props.regimens.length}
        searchTerm={this.state.searchTerm}
        onChange={searchTerm => this.setState({ searchTerm })} />
      <Row>
        <EmptyStateWrapper
          notEmpty={this.props.regimens.length > 0}
          graphic={EmptyStateGraphic.regimens}
          title={t("No Regimens.")}
          text={Content.NO_REGIMENS}>
          {this.props.regimens.length > 0 &&
            <div className="regimen-list">
              {this.rows()}
            </div>}
        </EmptyStateWrapper>
      </Row>
    </div>;
  }
}
