export namespace OpenFarm {

  /** An OpenFarm.cc crop entry. NOT a farmbot.cc Crop. */
  export interface OFCrop {
    name: string;
    slug: string;
    binomial_name: string;
    common_names: string[];
    description: string;
    sun_requirements: string;
    sowing_method: string;
    svg_icon?: string | undefined;
    // Unsure of this. Def not an object tho.
    spread?: number | undefined;
    row_spacing?: number;
    height?: number;
    processing_pictures: number;
  }

  export interface Self {
    api: string;
    website: string;
  }

  export interface Links {
    self: Self;
  }

  export interface Links2 {
    related: string;
  }

  export interface Datum2 {
    type: string;
    id: string;
  }

  export interface Pictures {
    links: Links2;
    data: Datum2[];
  }

  export interface Relationships {
    pictures: Pictures;
  }

  export interface Datum {
    id: string;
    type: string;
    attributes: OFCrop;
    links: Links;
    relationships: Relationships;
  }

  export interface ImageAttrs {
    id: string;
    image_url: string;
    small_url: string;
    thumbnail_url: string;
    medium_url: string;
    large_url: string;
    canopy_url: string;
  }

  export interface Included {
    id: string;
    type: string;
    attributes: ImageAttrs;
  }
}
/** Returned by https://openfarm.cc/api/v1/crops?filter=q */
export interface CropSearchResult {
  data: OpenFarm.Datum[];
  included: OpenFarm.Included[];
}
