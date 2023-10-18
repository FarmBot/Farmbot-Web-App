import { CropLiveSearchResult } from "../farm_designer/interfaces";

export const fakeCropLiveSearchResult = (): CropLiveSearchResult => ({
  crop: {
    name: "Mint",
    slug: "mint",
    binomial_name: "Mentha spicata",
    common_names: ["Mint", "spearmint"],
    description: "Mint is a perennial herb with a distinctive taste.",
    sun_requirements: "Partial sun",
    sowing_method: "Direct seed indoors or outside",
    processing_pictures: 0,
    main_image_path: "",
    spread: 25,
    row_spacing: 35,
    height: 60,
    growing_degree_days: 100,
  },
  images: ["fake-mint-svg"],
  companions: [
    { name: "Strawberry", slug: "strawberry", svg_icon: "fake-strawberry-svg" },
  ],
});
