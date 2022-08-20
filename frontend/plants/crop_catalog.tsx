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
import { Path } from "../internal_urls";
import { maybeFindPlantById } from "../resources/selectors_by_id";
import { Row } from "../ui";

export function mapStateToProps(props: Everything): CropCatalogProps {
  const {
    cropSearchQuery, cropSearchInProgress, cropSearchResults, plantTypeChangeId,
    bulkPlantSlug, hoveredPlant,
  } = props.resources.consumers.farm_designer;
  const plant = plantTypeChangeId
    ? maybeFindPlantById(props.resources.index, plantTypeChangeId)
    : undefined;
  return {
    openfarmSearch: OFSearch,
    cropSearchQuery,
    dispatch: props.dispatch,
    cropSearchResults,
    cropSearchInProgress,
    plant,
    bulkPlantSlug,
    hoveredPlant,
  };
}

export class RawCropCatalog extends React.Component<CropCatalogProps, {}> {

  debouncedOFSearch = debounce((searchTerm: string) => {
    this.props.openfarmSearch(searchTerm)(this.props.dispatch);
  }, 500);

  handleChange = (value: string) => {
    this.props.dispatch({ type: Actions.SEARCH_QUERY_CHANGE, payload: value });
    this.debouncedOFSearch(value);
  };

  get cropSearchQuery() { return this.props.cropSearchQuery || ""; }

  get tooShort() {
    const termLength = this.cropSearchQuery.length;
    return !this.props.cropSearchInProgress && termLength > 0 && termLength < 3;
  }

  get validSearchTerm() {
    return this.cropSearchQuery.length > 2;
  }

  get showResultChangeSpinner() {
    return this.props.cropSearchInProgress &&
      this.props.cropSearchResults.length > 0 &&
      this.validSearchTerm;
  }

  componentDidMount() {
    this.props.openfarmSearch(this.cropSearchQuery)(this.props.dispatch);
  }

  componentWillUnmount = () => this.props.dispatch({
    type: Actions.SET_PLANT_TYPE_CHANGE_ID,
    payload: undefined,
  });

  render() {
    return <DesignerPanel panelName={"crop-catalog"} panel={Panel.Plants}>
      <DesignerPanelHeader
        panelName={"crop-catalog"}
        panel={Panel.Plants}
        title={t("Choose a crop")}
        backTo={Path.plants()} />
      <DesignerPanelTop panel={Panel.Plants}>
        <SearchField
          searchTerm={this.cropSearchQuery}
          placeholder={t("Search OpenFarm...")}
          onChange={this.handleChange}
          onKeyPress={this.handleChange}
          autoFocus={true}
          customRightIcon={this.showResultChangeSpinner
            ? <Spinner radius={10} strokeWidth={3} />
            : undefined} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"crop-catalog"}>
        <Row className={"crop-search-result-wrapper"}>
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
              cropSearchInProgress={this.props.cropSearchInProgress}
              plant={this.props.plant}
              hoveredPlant={this.props.hoveredPlant}
              bulkPlantSlug={this.props.bulkPlantSlug}
              dispatch={this.props.dispatch} />
          </EmptyStateWrapper>
        </Row>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const CropCatalog = connect(mapStateToProps)(RawCropCatalog);
