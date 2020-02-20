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

export function svgToUrl(xml: string | undefined): string {
  return xml ?
    (DATA_URI + encodeURIComponent(xml)) : DEFAULT_ICON;
}
