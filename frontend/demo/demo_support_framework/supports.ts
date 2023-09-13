import {
    Xyz,
} from "farmbot";

// a local representation of the current status of position
export const demoPos: Record<Xyz, number | undefined> = {
    x: 0,
    y: 0,
    z: 0,
};

// limitation of the sample farmbot map
export const map_limit = {
    x: 2900,
    y: 1400,
    z: 400,
};