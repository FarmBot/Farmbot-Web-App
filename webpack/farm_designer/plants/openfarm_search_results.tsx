import * as React from "react";
import { Link } from "../../link";

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
}

export class OpenFarmResults extends React.Component<SearchResultProps, {}> {
  render() {
    return <div>
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
    </div>;
  }
}
