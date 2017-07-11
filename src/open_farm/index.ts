import axios from "axios";
import { Dictionary } from "farmbot/dist";
import * as _ from "lodash";
import { HttpData } from "../util";

const BASE = "https://openfarm.cc/api/v1/crops/";
export const DATA_URI = "data:image/svg+xml;utf8,";
export const DEFAULT_ICON = "/app-resources/img/generic-plant.svg";

let cache: Dictionary<Promise<Readonly<OFCropAttrs>>> = {};

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

/** PROBLEM: You have 100 lettuce plants. You don't want to download an SVG icon
 * 100 times.
 * SOLUTION: Cache stuff. */
export function cachedCrop(slug: string): Promise<Readonly<OFCropAttrs>> {
  cache[slug] = cache[slug] || (axios
    .get(BASE + slug)
    .then(cacheTheIcon(slug), cacheTheIcon(slug)));
  return cache[slug];
}

let cacheTheIcon = (slug: string) =>
  (resp: HttpData<OFCropResponse>): Readonly<OFCropAttrs> => {
    if (resp
      && resp.data
      && resp.data.data
      && resp.data.data.attributes) {
      return resp.data.data.attributes;
    } else {
      return { slug, svg_icon: undefined };
    }
  };

export function svgToUrl(xml: string | undefined): string {
  return xml ?
    (DATA_URI + encodeURIComponent(xml)) : DEFAULT_ICON;
}
