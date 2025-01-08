import React from "react";
import { Link } from "../link";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";
import { edit, save } from "../api/crud";
import { TaggedPlantPointer } from "farmbot";
import { setHoveredPlant } from "../farm_designer/map/actions";
import { HoveredPlantPayl } from "../farm_designer/interfaces";
import { findCrops, findIcon, findImage } from "../crops/find";
import { Crop } from "../crops/interfaces";

export interface SearchResultProps {
  searchTerm: string;
  plant: TaggedPlantPointer | undefined;
  dispatch: Function;
  bulkPlantSlug: string | undefined;
  hoveredPlant: HoveredPlantPayl;
}

export class CropSearchResults extends React.Component<SearchResultProps, {}> {
  render() {
    const { dispatch, plant } = this.props;
    const { plantUUID } = this.props.hoveredPlant;
    const to = (slug: string) => {
      if (plant) {
        return Path.plants(plant.body.id);
      }
      if (this.props.bulkPlantSlug) {
        return Path.plants("select");
      }
      return Path.cropSearch(slug);
    };
    const click = (slug: string, crop: Crop) => () => {
      if (plant) {
        dispatch(edit(plant, {
          name: crop.name,
          openfarm_slug: slug,
        }));
        dispatch(save(plant.uuid));
        dispatch({
          type: Actions.SET_PLANT_TYPE_CHANGE_ID,
          payload: undefined,
        });
        if (plant.uuid == plantUUID) {
          dispatch(setHoveredPlant(plantUUID));
        }
      }
      if (this.props.bulkPlantSlug) {
        dispatch({
          type: Actions.SET_SLUG_BULK,
          payload: slug,
        });
      }
    };
    const crops = findCrops(this.props.searchTerm);
    return <EmptyStateWrapper
      notEmpty={Object.values(crops).length > 0}
      graphic={EmptyStateGraphic.no_crop_results}
      title={t("No search results")}
      colorScheme={"plants"}>
      <div className={"crop-search-results-wrapper"}>
        {Object.entries(crops).map(([slug, crop]) => {
          const image = findImage(slug);
          return <Link
            key={slug}
            draggable={false}
            onClick={click(slug, crop)}
            to={to(slug)}>
            <div className={"plant-catalog-tile"}>
              <label>
                {crop.name}
              </label>
              <img className={!image ? "center" : ""}
                src={findIcon(slug)} />
              <div
                className={"plant-catalog-image"}
                style={{ background: `url(${image}) top center no-repeat` }}
                draggable={false} />
            </div>
          </Link>;
        })}
      </div>
    </EmptyStateWrapper>;
  }
}
