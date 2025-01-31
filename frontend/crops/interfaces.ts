export interface Crop {
    name: string;
    binomial_name: string;
    common_names: string[];
    description: string;
    sun_requirements: string;
    sowing_method: string;
    spread: number;
    row_spacing: number;
    height: number;
    growing_degree_days: number;
    companions: string[];
    icon: string;
    image: string;
}
export type Crops = Record<string, Crop>;
