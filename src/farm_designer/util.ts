import axios from "axios";
import * as _ from "lodash";
import { OpenFarm, CropSearchResult } from "./openfarm";
import { DEFAULT_ICON } from "../open_farm/index";
import { HttpPromise } from "../util";

let url = (q: string) => `${OpenFarm.cropUrl}?include=pictures&filter=${q}`;
type X = HttpPromise<CropSearchResult>;
let openFarmSearchQuery = _.throttle((q: string): X => axios.get(url(q)), 800);

export let OFSearch = (searchTerm: string) =>
  (dispatch: Function) => {
    dispatch({ type: "SEARCH_QUERY_CHANGE", payload: searchTerm });
    openFarmSearchQuery(searchTerm)
      .then(resp => {
        let images: { [key: string]: string } = {};
        _.get<OpenFarm.Included[]>(resp, "data.included", [])
          .map(item => {
            return { id: item.id, url: item.attributes.thumbnail_url };
          })
          .map((val, acc) => images[val.id] = val.url);
        let payload = resp.data.data.map(datum => {
          let crop = datum.attributes;
          let id = _.get(datum, "relationships.pictures.data[0].id", "");
          return { crop, image: (images[id] || DEFAULT_ICON) };
        });
        dispatch({ type: "OF_SEARCH_RESULTS_OK", payload });
      });
  };
