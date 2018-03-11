import axios, { AxiosResponse } from "axios";
import { Dictionary } from "farmbot";
import { isObject } from "lodash";

const BASE = "https://openfarm.cc/api/v1/crops/";
export const DATA_URI = "data:image/svg+xml;utf8,";
export const DEFAULT_ICON = "/app-resources/img/generic-plant.svg";

export interface OFCropAttrs {
  svg_icon?: string | undefined;
  spread?: number | undefined;
  slug: string;
}

export interface OFCropResponse {
  id?: undefined;
  // Attributes available, possibly not declared in the interface:
  // binomial_name, common_names, description,
  // growing_degree_days, guides_count, height, main_image_path,
  // name, processing_pictures, row_spacing, slug, sowing_method,
  // spread, sun_requirements, svg_icon, tags_array, taxon
  data?: {
    attributes?: OFCropAttrs | undefined;
  };
}

export namespace OpenFarmAPI {
  export let OFBaseURL = BASE;
}

type OFIcon = Readonly<OFCropAttrs>;
const STORAGE_KEY = "openfarm_icons_with_spread";

function initLocalStorage() {
  localStorage[STORAGE_KEY] = "{}";
  return {};
}

function getAllIconsFromCache(): Dictionary<OFIcon | undefined> {
  try {
    const dictionary = JSON.parse(localStorage[STORAGE_KEY]);
    return isObject(dictionary) ? dictionary : initLocalStorage();
  } catch (error) {
    return initLocalStorage();
  }
}

function localStorageIconFetch(slug: string): Promise<OFIcon> | undefined {
  const icon = getAllIconsFromCache()[slug];
  return icon ? Promise.resolve(icon) : undefined;
}

function localStorageIconSet(icon: OFIcon): void {
  const dictionary = getAllIconsFromCache();
  dictionary[icon.slug] = icon;
  localStorage[STORAGE_KEY] = JSON.stringify(dictionary);
}

/** PROBLEM: HTTP requests get fired too fast. If you have 10 garlic plants,
 * and the garlic icon is not cached locally, and you try to render 10 garlic
 * icons in the first 100ms, and HTTP requests take more than 100ms, you will
 * end up performing 10 HTTP requests at application start time. Not very
 * efficient */
const promiseCache: Dictionary<Promise<Readonly<OFCropAttrs>>> = {};

function HTTPIconFetch(slug: string) {
  const url = BASE + slug;
  if (promiseCache[url]) {
    return promiseCache[url];
  } else {
    promiseCache[url] = axios
      .get<OFCropResponse>(url)
      .then(cacheTheIcon(slug), cacheTheIcon(slug));
    return promiseCache[url];
  }
}

/** PROBLEM: You have 100 lettuce plants. You don't want to download an SVG icon
 * 100 times.
 * SOLUTION: Cache stuff. */
export function cachedCrop(slug: string): Promise<OFIcon> {
  return localStorageIconFetch(slug) || HTTPIconFetch(slug);
}

const cacheTheIcon = (slug: string) =>
  (resp: AxiosResponse<OFCropResponse>): OFIcon => {
    if (resp
      && resp.data
      && resp.data.data
      && resp.data.data.attributes) {
      const icon = {
        slug: resp.data.data.attributes.slug,
        spread: resp.data.data.attributes.spread,
        svg_icon: resp.data.data.attributes.svg_icon
      };
      localStorageIconSet(icon);
      return icon;
    } else {
      return { slug, spread: undefined, svg_icon: undefined };
    }
  };

export function svgToUrl(xml: string | undefined): string {
  return xml ?
    (DATA_URI + encodeURIComponent(xml)) : DEFAULT_ICON;
}
