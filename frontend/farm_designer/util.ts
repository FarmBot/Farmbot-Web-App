import axios, { AxiosPromise } from "axios";
import {
  OpenFarm, CropSearchResult, CropSearchResultSpecific,
} from "../open_farm/openfarm";
import { Actions } from "../constants";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import { flatten, get } from "lodash";
import { ExternalUrl } from "../external_urls";
import { FilePath } from "../internal_urls";

const searchUrl = (q: string) =>
  `${ExternalUrl.OpenFarm.cropApi}?include=pictures&filter=${q}`;
const specificUrl = (q: string) => `${ExternalUrl.OpenFarm.cropApi}${q}`;
const openFarmSearchQuery =
  (q: string): AxiosPromise<CropSearchResult> =>
    axios.get<CropSearchResult>(searchUrl(q));
const openFarmSearchQuerySpecific =
  (q: string): AxiosPromise<CropSearchResultSpecific> =>
    axios.get<CropSearchResultSpecific>(specificUrl(q));

const FALLBACK: OpenFarm.Included[] = [];
const OFSearchRaw = (specific: boolean) => (searchTerm: string) =>
  (dispatch: Function) => {
    dispatch({ type: Actions.OF_SEARCH_RESULTS_START, payload: undefined });
    (specific
      ? openFarmSearchQuerySpecific(searchTerm)
      : openFarmSearchQuery(searchTerm))
      .then(resp => {
        const imageUrls: string[] = [];
        const companions: OpenFarm.CompanionsData[] = [];
        get(resp, "data.included", FALLBACK)
          .map((item: OpenFarm.Included) => {
            switch (item.type) {
              case "crops-pictures":
                imageUrls.push(item.attributes.thumbnail_url);
                break;
              case "crops":
                const { name, slug, svg_icon } = item.attributes;
                companions.push({ name, slug, svg_icon });
                break;
            }
          });
        const payload = flatten([resp.data.data]).map(datum => {
          const crop = datum.attributes;
          const images = imageUrls.length > 0 ? imageUrls : [FilePath.DEFAULT_ICON];
          return { crop, images, companions };
        });
        dispatch({ type: Actions.OF_SEARCH_RESULTS_OK, payload });
      })
      .catch(() =>
        dispatch({ type: Actions.OF_SEARCH_RESULTS_NO, payload: undefined }));
  };

export const OFCropFetch = OFSearchRaw(true);
export const OFSearch = OFSearchRaw(false);

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
