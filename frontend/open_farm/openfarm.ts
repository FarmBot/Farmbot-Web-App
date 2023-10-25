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
    guides_count?: number;
    main_image_path: string;
    taxon?: string;
    tags_array?: string[];
    growing_degree_days?: number;
  }

  export interface CompanionsData {
    name: string;
    slug: string;
    svg_icon?: string | undefined;
  }

  interface Self {
    api: string;
    website: string;
  }

  export interface Links {
    self: Self;
  }

  interface Links2 {
    related: string;
  }

  interface Datum2 {
    type: string;
    id: string;
  }

  export interface Companions {
    links: Links2;
  }

  interface Pictures {
    links: Links2;
    data: Datum2[];
  }

  interface Relationships {
    companions: Companions;
    pictures: Pictures;
  }

  export interface Datum {
    id: string;
    type: string;
    attributes: OFCrop;
    links: Links;
    relationships: Relationships;
  }

  interface ImageAttrs {
    id: string;
    image_url: string;
    small_url: string;
    thumbnail_url: string;
    medium_url: string;
    large_url: string;
    canopy_url: string;
  }

  interface IncludedPictures {
    id: string;
    type: "crops-pictures";
    attributes: ImageAttrs;
  }

  interface IncludedCompanion {
    id: string;
    type: "crops";
    attributes: OFCrop;
    links: Links;
    relationships: Relationships;
  }

  export type Included = IncludedPictures | IncludedCompanion;
}

/** Returned by https://openfarm.cc/api/v1/crops?filter=q */
export interface CropSearchResult {
  data: OpenFarm.Datum[];
  included: OpenFarm.Included[];
}

/** Returned by https://openfarm.cc/api/v1/q */
export interface CropSearchResultSpecific {
  data: OpenFarm.Datum;
  included: OpenFarm.Included[];
}
