import * as React from "react";
import { Link } from "../../link";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";
import { ExternalUrl } from "../../external_urls";

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
}

export class OpenFarmResults extends React.Component<SearchResultProps, {}> {

  get text(): JSX.Element {
    return <p>{`${t(Content.CROP_NOT_FOUND_INTRO)} `}
      <a href={ExternalUrl.OpenFarm.newCrop} target="_blank">
        {t(Content.CROP_NOT_FOUND_LINK)}
      </a>
    </p>;
  }

  render() {
    return <EmptyStateWrapper
      notEmpty={this.props.cropSearchResults.length > 0}
      graphic={EmptyStateGraphic.no_crop_results}
      title={this.props.cropSearchInProgress
        ? t("Searching...")
        : t("No search results")}
      textElement={this.props.cropSearchInProgress ? undefined : this.text}
      colorScheme={"plants"}>
      {this.props.cropSearchResults.map(resp => {
        const { crop, image } = resp;
        return <Link
          key={resp.crop.slug}
          draggable={false}
          to={`/app/designer/plants/crop_search/` + crop.slug.toString()}>
          <div className="plant-catalog-tile col-xs-6">
            <label>
              {crop.name}
            </label>
            <div
              className="plant-catalog-image"
              style={{ background: `url(${image}) top center no-repeat` }}
              draggable={false} />
          </div>
        </Link>;
      })}
    </EmptyStateWrapper>;
  }
}
