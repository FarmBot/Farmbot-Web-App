import * as React from "react";
import { t } from "i18next";
import { RegimenListItem } from "./regimen_list_item";
import { AddRegimen } from "./add_button";
import { Row, Col, ToolTip } from "../../ui/index";
import { RegimensListProps, RegimensListState } from "../interfaces";
import { sortResourcesById, urlFriendly, lastUrlChunk } from "../../util";
import { ToolTips } from "../../constants";
import { push } from "../../history";
import { selectRegimen } from "../actions";

export class RegimensList extends
  React.Component<RegimensListProps, RegimensListState> {

  state: RegimensListState = {
    searchTerm: ""
  };

  componentDidMount() {
    let { dispatch, regimen, regimens } = this.props;

    regimen && urlFriendly(regimen.body.name) &&
      push("/app/regimens/" + urlFriendly(regimen.body.name));

    regimens.map(reg => {
      if (lastUrlChunk() === urlFriendly(reg.body.name)) {
        // TODO: Hack :( Can't seem to figure out why this won't work...
        setTimeout(() => dispatch(selectRegimen(reg)), 0);
      }
    });
  }

  rows = () => {
    let searchTerm = this.state.searchTerm.toLowerCase();
    return <Col xs={12}>
      {sortResourcesById(this.props.regimens)
        .filter(regimen => regimen.body.name.toLowerCase().includes(searchTerm))
        .map((regimen, index) => {
          return <RegimenListItem
            index={index}
            key={index}
            regimen={regimen}
            dispatch={this.props.dispatch}
          />;
        })}
    </Col>;
  }

  onChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.currentTarget.value });
  }

  render() {
    return <div className="regimen-list">
      <h3>
        <i>{t("Regimens")}</i>
      </h3>
      <ToolTip helpText={ToolTips.REGIMEN_LIST} />
      <AddRegimen dispatch={this.props.dispatch} />
      <input
        onChange={this.onChange}
        placeholder={t("Search Regimens...")}
      />
      <Row>
        {this.rows()}
      </Row>
    </div>;
  }
}
