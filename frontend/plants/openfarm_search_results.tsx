import React from "react";
import { Link } from "../link";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content } from "../constants";
import { t } from "../i18next_wrapper";
import { ExternalUrl } from "../external_urls";
import { FilePath, Path } from "../internal_urls";
import { edit, save } from "../api/crud";
import { TaggedPlantPointer } from "farmbot";
import { setHoveredPlant } from "../farm_designer/map/actions";
import { HoveredPlantPayl } from "../farm_designer/interfaces";

/** A stripped down version of OFSearchResult */
interface Result {
  crop: {
    slug: string;
    name: string;
    svg_icon?: string | undefined;
    main_image_path: string;
  };
  images: string[];
}

export interface SearchResultProps {
  cropSearchResults: Result[];
  cropSearchInProgress: boolean;
  plant: TaggedPlantPointer | undefined;
  dispatch: Function;
  bulkPlantSlug: string | undefined;
  hoveredPlant: HoveredPlantPayl;
}

export class OpenFarmResults extends React.Component<SearchResultProps, {}> {

  get text(): JSX.Element {
    return <p>{`${t(Content.CROP_NOT_FOUND_INTRO)} `}
      <a href={ExternalUrl.OpenFarm.newCrop} target="_blank" rel={"noreferrer"}>
        {t(Content.CROP_NOT_FOUND_LINK)}
      </a>
    </p>;
  }

  render() {
    const {
      cropSearchResults, cropSearchInProgress, dispatch, plant,
    } = this.props;
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
    const click = (crop: Result["crop"]) => () => {
      if (plant) {
        dispatch(edit(plant, {
          name: crop.name,
          openfarm_slug: crop.slug,
        }));
        dispatch(save(plant.uuid));
        dispatch({
          type: Actions.SET_PLANT_TYPE_CHANGE_ID,
          payload: undefined,
        });
        if (plant.uuid == plantUUID && crop.svg_icon) {
          dispatch(setHoveredPlant(plantUUID, crop.svg_icon));
        }
      }
      if (this.props.bulkPlantSlug) {
        dispatch({
          type: Actions.SET_SLUG_BULK,
          payload: crop.slug,
        });
      }
    };
    return <EmptyStateWrapper
      notEmpty={cropSearchResults.length > 0}
      graphic={EmptyStateGraphic.no_crop_results}
      title={cropSearchInProgress
        ? t("Searching...")
        : t("No search results")}
      textElement={cropSearchInProgress ? undefined : this.text}
      colorScheme={"plants"}>
      <div className={"openfarm-search-results-wrapper"}>
        {cropSearchResults.map(resp => {
          const { crop } = resp;
          const image = crop.main_image_path.startsWith("https")
            ? crop.main_image_path
            : FilePath.DEFAULT_ICON;
          return <Link
            key={crop.slug}
            draggable={false}
            onClick={click(crop)}
            to={to(crop.slug)}>
            <div className={"plant-catalog-tile"}>
              <label>
                {crop.name}
              </label>
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
