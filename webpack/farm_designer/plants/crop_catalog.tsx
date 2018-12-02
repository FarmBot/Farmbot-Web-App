import * as React from "react";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { t } from "i18next";
import { OpenFarmResults } from "./openfarm_search_results";
import { CropCatalogProps } from "../interfaces";
import { OFSearch } from "../util";
import { debounce } from "lodash";
import { Actions, Content } from "../../constants";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { Spinner } from "../../extras/spinner";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent, DesignerPanelTop
} from "./designer_panel";

export function mapStateToProps(props: Everything): CropCatalogProps {
  const { cropSearchQuery, cropSearchInProgress, cropSearchResults
  } = props.resources.consumers.farm_designer;
  return {
    openfarmSearch: OFSearch,
    cropSearchQuery,
    dispatch: props.dispatch,
    cropSearchResults,
    cropSearchInProgress,
  };
}

@connect(mapStateToProps)
export class CropCatalog extends React.Component<CropCatalogProps, {}> {

  debouncedOFSearch = debounce((searchTerm: string) => {
    this.props.openfarmSearch(searchTerm)(this.props.dispatch);
  }, 500);

  handleChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    this.props.dispatch({ type: Actions.SEARCH_QUERY_CHANGE, payload: value });
    this.debouncedOFSearch(value);
  }

  get tooShort() {
    const termLength = this.props.cropSearchQuery.length;
    return !this.props.cropSearchInProgress && termLength > 0 && termLength < 3;
  }

  get validSearchTerm() {
    return this.props.cropSearchQuery.length > 2;
  }

  get showResultChangeSpinner() {
    return this.props.cropSearchInProgress &&
      this.props.cropSearchResults.length > 0 &&
      this.validSearchTerm;
  }

  render() {
    return <DesignerPanel panelName={"crop-catalog"} panelColor={"green"}>
      <DesignerPanelHeader
        panelName={"crop-catalog"}
        panelColor={"green"}
        title={t("Choose a crop")}
        backTo={"/app/designer/plants"} />
      <DesignerPanelTop>
        <div className="thin-search">
          <input
            autoFocus={true}
            value={this.props.cropSearchQuery}
            onChange={this.handleChange}
            onKeyPress={this.handleChange}
            className="search"
            placeholder={t("Search OpenFarm...")} />
          {this.showResultChangeSpinner &&
            <Spinner radius={10} strokeWidth={3} />}
        </div>
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"crop-catalog"}>
        <div className="crop-search-result-wrapper row">
          <EmptyStateWrapper
            notEmpty={this.validSearchTerm}
            graphic={EmptyStateGraphic.crops}
            title={this.tooShort
              ? t("Search term too short")
              : t("What do you want to grow?")}
            text={Content.ENTER_CROP_SEARCH_TERM}
            colorScheme={"plants"}>
            <OpenFarmResults
              cropSearchResults={this.props.cropSearchResults}
              cropSearchInProgress={this.props.cropSearchInProgress} />
          </EmptyStateWrapper>
        </div>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
