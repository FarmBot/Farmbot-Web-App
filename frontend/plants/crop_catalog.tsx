import React from "react";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { OpenFarmResults } from "./openfarm_search_results";
import { CropCatalogProps } from "../farm_designer/interfaces";
import { OFSearch } from "../farm_designer/util";
import { debounce } from "lodash";
import { Actions, Content } from "../constants";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Spinner } from "../extras/spinner";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { SearchField } from "../ui/search_field";

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

export class RawCropCatalog extends React.Component<CropCatalogProps, {}> {

  debouncedOFSearch = debounce((searchTerm: string) => {
    this.props.openfarmSearch(searchTerm)(this.props.dispatch);
  }, 500);

  handleChange = (value: string) => {
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

  componentDidMount() {
    this.props.openfarmSearch(this.props.cropSearchQuery)(this.props.dispatch);
  }

  render() {
    return <DesignerPanel panelName={"crop-catalog"} panel={Panel.Plants}>
      <DesignerPanelHeader
        panelName={"crop-catalog"}
        panel={Panel.Plants}
        title={t("Choose a crop")}
        backTo={"/app/designer/plants"} />
      <DesignerPanelTop panel={Panel.Plants}>
        <SearchField
          searchTerm={this.props.cropSearchQuery}
          placeholder={t("Search OpenFarm...")}
          onChange={this.handleChange}
          onKeyPress={this.handleChange}
          autoFocus={true}
          customRightIcon={this.showResultChangeSpinner
            ? <Spinner radius={10} strokeWidth={3} />
            : undefined} />
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

export const CropCatalog = connect(mapStateToProps)(RawCropCatalog);
