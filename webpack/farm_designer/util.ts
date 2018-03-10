import axios, { AxiosPromise } from "axios";
import * as _ from "lodash";
import { OpenFarm, CropSearchResult } from "./openfarm";
import { DEFAULT_ICON } from "../open_farm/icons";
import { ExecutableType } from "./interfaces";

const url = (q: string) => `${OpenFarm.cropUrl}?include=pictures&filter=${q}`;
const openFarmSearchQuery = (q: string): AxiosPromise<CropSearchResult> =>
  axios.get<CropSearchResult>(url(q));

interface IdURL {
  id: string;
  url: string;
}

const FALLBACK: OpenFarm.Included[] = [];
export let OFSearch = (searchTerm: string) =>
  (dispatch: Function) => {
    openFarmSearchQuery(searchTerm)
      .then(resp => {
        const images: { [key: string]: string } = {};
        _.get(resp, "data.included", FALLBACK)
          .map((item: OpenFarm.Included) => {
            return { id: item.id, url: item.attributes.thumbnail_url };
          })
          .map((val: IdURL) => images[val.id] = val.url);
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
