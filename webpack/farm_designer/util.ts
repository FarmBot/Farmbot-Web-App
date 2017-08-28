import axios from "axios";
import * as _ from "lodash";
import { OpenFarm, CropSearchResult } from "./openfarm";
import { DEFAULT_ICON } from "../open_farm/index";
import { HttpPromise } from "../util";
import { ExecutableType } from "./interfaces";

const url = (q: string) => `${OpenFarm.cropUrl}?include=pictures&filter=${q}`;
type X = HttpPromise<CropSearchResult>;
const openFarmSearchQuery = _.throttle((q: string): X => axios.get(url(q)), 800);

export let OFSearch = (searchTerm: string) =>
  (dispatch: Function) => {
    dispatch({ type: "SEARCH_QUERY_CHANGE", payload: searchTerm });
    openFarmSearchQuery(searchTerm)
      .then(resp => {
        const images: { [key: string]: string } = {};
        _.get<OpenFarm.Included[]>(resp, "data.included", [])
          .map(item => {
            return { id: item.id, url: item.attributes.thumbnail_url };
          })
          .map((val, acc) => images[val.id] = val.url);
        const payload = resp.data.data.map(datum => {
          const crop = datum.attributes;
          const id = _.get(datum, "relationships.pictures.data[0].id", "");
          return { crop, image: (images[id] || DEFAULT_ICON) };
        });
        dispatch({ type: "OF_SEARCH_RESULTS_OK", payload });
      });
  };

function isExecutableType(x?: string): x is ExecutableType {
  const EXECUTABLES: ExecutableType[] = ["Sequence", "Regimen"];
  return !!EXECUTABLES.includes(x as ExecutableType);
}

/** USE CASE: You have a `string?` type that you are *certain*
 *            is an `ExecutableType`. But the type checker is
 *            complaining.
 *
 *  PROBLEM:  `as ExecutableType` results in less type safety and
 *            makes bugs harder to pin point in production.
 *
 * SOLUTION:  Run a user defined type guard (`x is ExecutableType`)
 *            and raise a runtime error with the offending string
 */
export function executableType(input?: string): ExecutableType {
  if (isExecutableType(input)) {
    return input;
  } else {
    throw new Error("Assumed string was ExecutableType. Got: " + input);
  }
}
