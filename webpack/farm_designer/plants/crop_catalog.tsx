import * as React from "react";
import { history } from "../../history";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { t } from "i18next";
import { OpenFarmResults } from "./openfarm_search_results";
import { CropCatalogProps } from "../interfaces";
import { OFSearch } from "../util";
import * as _ from "lodash";
import { catchErrors } from "../../util";

export function mapStateToProps(props: Everything): CropCatalogProps {
  return {
    OFSearch,
    cropSearchQuery: props.resources.consumers.farm_designer.cropSearchQuery,
    dispatch: Function,
    cropSearchResults: props
      .resources
      .consumers
      .farm_designer
      .cropSearchResults || []
  };
}

@connect(mapStateToProps)
export class CropCatalog extends React.Component<CropCatalogProps, {}> {
  componentDidCatch(x: Error) { catchErrors(x); }

  debouncedOFSearch = _.debounce((searchTerm: string) => {
    this.props.OFSearch(searchTerm)(this.props.dispatch);
  }, 500);

  handleChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    this.props.dispatch({ type: "SEARCH_QUERY_CHANGE", payload: value });
    this.debouncedOFSearch(value);
  }

  render() {
    return <div className="panel-container green-panel crop-catalog-panel">
      <div className="panel-header green-panel">
        <p className="panel-title">
          <i className="fa fa-arrow-left plant-panel-back-arrow"
            onClick={() => history.push("/app/designer/plants")} />
          {t("Choose a crop")}
        </p>
      </div>
      <div className="panel-top">
        <div className="thin-search-wrapper">
          <div className="text-input-wrapper">
            <i className="fa fa-search"></i>
            <div className="thin-search">
              <input
                value={this.props.cropSearchQuery}
                onChange={this.handleChange}
                onKeyPress={this.handleChange}
                className="search"
                placeholder={t("Search OpenFarm...")} />
            </div>
          </div>
        </div>
        <div className="panel-content">
          <div className="crop-search-result-wrapper row">
            <OpenFarmResults cropSearchResults={this.props.cropSearchResults} />
          </div>
        </div>
      </div>
    </div>;
  }
}
