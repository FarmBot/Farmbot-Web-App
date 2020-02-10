import axios, { AxiosResponse } from "axios";
import { Dictionary } from "farmbot";
import { isObject } from "lodash";
import { OFCropAttrs, OFCropResponse, OpenFarmAPI, svgToUrl } from "./icons";

export type OFIcon = Readonly<OFCropAttrs>;
type IconDictionary = Dictionary<OFIcon | undefined>;

const STORAGE_KEY = "openfarm_icons_with_spread";

function initLocalStorage() {
  localStorage.setItem(STORAGE_KEY, "{}");
  return {};
}

function getAllIconsFromCache(): IconDictionary {
  try {
    const dictionary = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
    return isObject(dictionary) ? dictionary as IconDictionary : initLocalStorage();
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionary));
}

/** PROBLEM: HTTP requests get fired too fast. If you have 10 garlic plants,
 * and the garlic icon is not cached locally, and you try to render 10 garlic
 * icons in the first 100ms, and HTTP requests take more than 100ms, you will
 * end up performing 10 HTTP requests at application start time. Not very
 * efficient.
 * SOLUTION: Keep a record of open requests to avoid duplicate requests. */
export const promiseCache: Dictionary<Promise<Readonly<OFCropAttrs>>> = {};

const cacheTheIcon = (slug: string) =>
  (resp: AxiosResponse<OFCropResponse>): OFIcon => {
    if (resp?.data?.data?.attributes) {
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

function HTTPIconFetch(slug: string) {
  const url = OpenFarmAPI.OFBaseURL + slug;
  // Avoid duplicate requests.
  if (promiseCache[url]) { return promiseCache[url]; }
  promiseCache[url] = axios
    .get<OFCropResponse>(url)
    .then(cacheTheIcon(slug), cacheTheIcon(slug));
  return promiseCache[url];
}

/** PROBLEM: You have 100 lettuce plants. You don't want to download an SVG icon
 * 100 times.
 * SOLUTION: Cache stuff. */
export function cachedCrop(slug: string): Promise<OFIcon> {
  return localStorageIconFetch(slug) || HTTPIconFetch(slug);
}

export const maybeGetCachedPlantIcon = (
  slug: string | undefined,
  target: React.SyntheticEvent<HTMLImageElement>["currentTarget"],
  cb: (icon: string) => void) => {
  slug && cachedCrop(slug)
    .then(crop => {
      const i = svgToUrl(crop.svg_icon);
      setImgSrc(target, i);
      cb(i);
    });
};

export const setImgSrc = (
  target: React.SyntheticEvent<HTMLImageElement>["currentTarget"],
  icon: string) => {
  if (icon !== target.getAttribute("src")) {
    target.setAttribute("src", icon);
  }
};
