import React from "react";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { CropSearchResults } from "./crop_search_results";
import { CropCatalogProps } from "../farm_designer/interfaces";
import { Actions, Content } from "../constants";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
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
    plantTypeChangeId,
    bulkPlantSlug, hoveredPlant,
  } = props.resources.consumers.farm_designer;
  const plant = plantTypeChangeId
    ? maybeFindPlantById(props.resources.index, plantTypeChangeId)
    : undefined;
  return {
    cropSearchQuery: props.resources.consumers.farm_designer.cropSearchQuery,
    dispatch: props.dispatch,
    plant,
    bulkPlantSlug,
    hoveredPlant,
  };
}

export class RawCropCatalog
  extends React.Component<CropCatalogProps> {

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
        <SearchField nameKey={"crops"}
          searchTerm={this.props.cropSearchQuery}
          placeholder={t("Search crops...")}
          onChange={searchTerm => this.props.dispatch({
            type: Actions.SEARCH_QUERY_CHANGE,
            payload: searchTerm,
          })}
          autoFocus={true} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"crop-catalog"}>
        <Row className={"crop-search-result-wrapper"}>
          <EmptyStateWrapper
            notEmpty={this.props.cropSearchQuery}
            graphic={EmptyStateGraphic.crops}
            title={t("What do you want to grow?")}
            text={Content.ENTER_CROP_SEARCH_TERM}
            colorScheme={"plants"}>
            <CropSearchResults
              searchTerm={this.props.cropSearchQuery}
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
// eslint-disable-next-line import/no-default-export
export default CropCatalog;
