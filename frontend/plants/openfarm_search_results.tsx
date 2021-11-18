import React from "react";
import { Link } from "../link";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content } from "../constants";
import { t } from "../i18next_wrapper";
import { ExternalUrl } from "../external_urls";
import { Path } from "../internal_urls";
import { edit, save } from "../api/crud";
import { TaggedPlantPointer } from "farmbot";

/** A stripped down version of OFSearchResult */
interface Result {
  crop: {
    slug: string;
    name: string;
  };
  image: string;
}

export interface SearchResultProps {
  cropSearchResults: Result[];
  cropSearchInProgress: boolean;
  plant: TaggedPlantPointer | undefined;
  dispatch: Function;
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
    return <EmptyStateWrapper
      notEmpty={cropSearchResults.length > 0}
      graphic={EmptyStateGraphic.no_crop_results}
      title={cropSearchInProgress
        ? t("Searching...")
        : t("No search results")}
      textElement={cropSearchInProgress ? undefined : this.text}
      colorScheme={"plants"}>
      {cropSearchResults.map(resp => {
        const { crop, image } = resp;
        return <Link
          key={resp.crop.slug}
          draggable={false}
          onClick={() => {
            if (plant) {
              dispatch(edit(plant, {
                name: resp.crop.name,
                openfarm_slug: resp.crop.slug,
              }));
              dispatch(save(plant.uuid));
              dispatch({
                type: Actions.SET_PLANT_TYPE_CHANGE_ID,
                payload: undefined,
              });
            }
          }}
          to={plant
            ? Path.plants(plant.body.id)
            : Path.cropSearch(crop.slug)}>
          <div className={"plant-catalog-tile col-xs-6"}>
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
    </EmptyStateWrapper>;
  }
}
