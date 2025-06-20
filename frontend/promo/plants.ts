import { kebabCase, sampleSize } from "lodash";
import { findIcon } from "../crops/find";
import { Config } from "../three_d_garden/config";
import { ThreeDGardenPlant } from "../three_d_garden/garden";
import { Season, SEASON_DURATIONS } from "./constants";

export const calculatePlantPositions = (config: Config): ThreeDGardenPlant[] => {
  const gardenPlants = GARDENS[config.plants] || [];
  const positions: ThreeDGardenPlant[] = [];
  const startX = 350;
  let nextX = startX;
  let index = 0;
  while (nextX <= config.bedLengthOuter - 100) {
    const plantKey = gardenPlants[index];
    const plant = PLANTS[plantKey];
    if (!plant) { return []; }
    const icon = findIcon(kebabCase(plant.label));
    positions.push({
      ...plant,
      icon,
      x: nextX,
      y: config.bedWidthOuter / 2,
      key: plantKey,
      seed: Math.random(),
    });
    const plantsPerHalfRow =
      Math.ceil((config.bedWidthOuter - plant.spread) / 2 / plant.spread);
    for (let i = 1; i < plantsPerHalfRow; i++) {
      positions.push({
        ...plant,
        icon,
        x: nextX,
        y: config.bedWidthOuter / 2 + plant.spread * i,
        key: plantKey,
        seed: Math.random(),
      });
      positions.push({
        ...plant,
        icon,
        x: nextX,
        y: config.bedWidthOuter / 2 - plant.spread * i,
        key: plantKey,
        seed: Math.random(),
      });
    }
    if (index + 1 < gardenPlants.length) {
      const nextPlant = PLANTS[gardenPlants[index + 1]];
      nextX += (plant.spread / 2) + (nextPlant.spread / 2);
      index++;
    } else {
      index = 0;
      const nextPlant = PLANTS[gardenPlants[0]];
      nextX += (plant.spread / 2) + (nextPlant.spread / 2);
    }
  }
  return positions;
};

interface Plant {
  label: string;
  spread: number;
  size: number;
}

interface Gardens {
  [key: string]: string[];
}

export const PLANTS: Record<string, Plant> = {
  anaheimPepper: {
    label: "Anaheim Pepper",
    spread: 400,
    size: 150,
  },
  arugula: {
    label: "Arugula",
    spread: 250,
    size: 180,
  },
  basil: {
    label: "Basil",
    spread: 250,
    size: 160,
  },
  beet: {
    label: "Beet",
    spread: 175,
    size: 150,
  },
  bibbLettuce: {
    label: "Bibb Lettuce",
    spread: 250,
    size: 200,
  },
  bokChoy: {
    label: "Bok Choy",
    spread: 210,
    size: 160,
  },
  broccoli: {
    label: "Broccoli",
    spread: 375,
    size: 250,
  },
  brusselsSprout: {
    label: "Brussels Sprout",
    spread: 300,
    size: 250,
  },
  carrot: {
    label: "Carrot",
    spread: 150,
    size: 125,
  },
  cauliflower: {
    label: "Cauliflower",
    spread: 400,
    size: 250,
  },
  celery: {
    label: "Celery",
    spread: 350,
    size: 200,
  },
  chard: {
    label: "Swiss Chard",
    spread: 300,
    size: 300,
  },
  cherryBelleRadish: {
    label: "Cherry Bell Radish",
    spread: 100,
    size: 100,
  },
  cilantro: {
    label: "Cilantro",
    spread: 180,
    size: 150,
  },
  collardGreens: {
    label: "Collard Greens",
    spread: 230,
    size: 230,
  },
  cucumber: {
    label: "Cucumber",
    spread: 400,
    size: 200,
  },
  eggplant: {
    label: "Eggplant",
    spread: 400,
    size: 200,
  },
  frenchBreakfastRadish: {
    label: "French Breakfast Radish",
    spread: 100,
    size: 100,
  },
  garlic: {
    label: "Garlic",
    spread: 175,
    size: 100,
  },
  goldenBeet: {
    label: "Golden Beet",
    spread: 175,
    size: 150,
  },
  hillbillyTomato: {
    label: "Hillbilly Tomato",
    spread: 400,
    size: 200,
  },
  icicleRadish: {
    label: "Icicle Radish",
    spread: 100,
    size: 100,
  },
  laciantoKale: {
    label: "Lacianto Kale",
    spread: 250,
    size: 220,
  },
  leek: {
    label: "Leek",
    spread: 200,
    size: 200,
  },
  napaCabbage: {
    label: "Napa Cabbage",
    spread: 400,
    size: 220,
  },
  okra: {
    label: "Okra",
    spread: 400,
    size: 200,
  },
  parsnip: {
    label: "Parsnip",
    spread: 180,
    size: 120,
  },
  rainbowChard: {
    label: "Rainbow Chard",
    spread: 250,
    size: 250,
  },
  redBellPepper: {
    label: "Red Bell Pepper",
    spread: 350,
    size: 200,
  },
  redCurlyKale: {
    label: "Red Curly Kale",
    spread: 350,
    size: 220,
  },
  redRussianKale: {
    label: "Red Russian Kale",
    spread: 250,
    size: 200,
  },
  runnerBean: {
    label: "Runner Bean",
    spread: 350,
    size: 200,
  },
  rutabaga: {
    label: "Rutabaga",
    spread: 200,
    size: 150,
  },
  savoyCabbage: {
    label: "Savoy Cabbage",
    spread: 400,
    size: 250,
  },
  shallot: {
    label: "Shallot",
    spread: 200,
    size: 140,
  },
  snapPea: {
    label: "Snap Pea",
    spread: 200,
    size: 150,
  },
  spinach: {
    label: "Spinach",
    spread: 250,
    size: 200,
  },
  sweetPotato: {
    label: "Sweet Potato",
    spread: 400,
    size: 180,
  },
  turmeric: {
    label: "Turmeric",
    spread: 250,
    size: 150,
  },
  turnip: {
    label: "Turnip",
    spread: 175,
    size: 150,
  },
  yellowOnion: {
    label: "Yellow Onion",
    spread: 200,
    size: 150,
  },
  zucchini: {
    label: "Zucchini",
    spread: 400,
    size: 250,
  },
};

export const GARDENS: Gardens = {
  [Season.Spring]: [
    "beet", "bibbLettuce", "broccoli", "carrot", "cauliflower", "rainbowChard",
    "icicleRadish", "redRussianKale", "bokChoy", "spinach", "snapPea",
  ],
  [Season.Summer]: [
    "anaheimPepper", "basil", "cucumber", "eggplant", "hillbillyTomato", "okra",
    "redBellPepper", "runnerBean", "sweetPotato", "zucchini",
  ],
  [Season.Fall]: [
    "arugula", "cherryBelleRadish", "cilantro", "collardGreens", "garlic",
    "goldenBeet", "leek", "laciantoKale", "turnip", "yellowOnion",
  ],
  [Season.Winter]: [
    "frenchBreakfastRadish", "napaCabbage", "parsnip", "redCurlyKale",
    "rutabaga", "savoyCabbage", "shallot", "turmeric", "celery", "brusselsSprout",
  ],
  [Season.Random]: sampleSize(Object.keys(PLANTS), 20),
};

const CROP_DELAYS: Record<string, number> = Object.keys(PLANTS)
  .reduce((acc, key) => {
    acc[key] = Math.random() / 10;
    return acc;
  }, {} as Record<string, number>);

export const getSizeAtTime = (
  plant: ThreeDGardenPlant,
  season: string,
  t: number,
  cropFallbackDelay = 0,
  report = false,
): number => {

  const cropStartDelayFraction = CROP_DELAYS[plant.key] || (cropFallbackDelay / 10);
  const plantStartDelayFraction = plant.seed / 20;
  const startDelayFraction = cropStartDelayFraction + plantStartDelayFraction;
  const growDurationFraction = 1 / 3 + plant.seed / 3;
  const shrinkDelayFraction = plant.seed / 15;

  const totalCycle = SEASON_DURATIONS[season];
  const startDelay = startDelayFraction * totalCycle;
  const growDuration = growDurationFraction * totalCycle;
  const shrinkDelay = shrinkDelayFraction * totalCycle;

  const growStart = startDelay;
  const growEnd = growStart + growDuration;
  const shrinkStart = Math.max(growEnd, 0.8 * totalCycle) + shrinkDelay;
  const fullSizeDuration = shrinkStart - growEnd;
  const shrinkEnd = totalCycle;
  const shrinkDuration = shrinkEnd - shrinkStart;

  if (report) {
    console.table({
      growStart, startDelay,
      growEnd, growDuration,
      fullSizeDuration,
      shrinkStart, shrinkDelay,
      shrinkEnd, shrinkDuration,
    });
  }

  if (t < growStart) {
    return 0;
  }
  if (t < growEnd) {
    return (t - growStart) / growDuration;
  }
  if (t < shrinkStart) {
    return 1;
  }
  if (t < shrinkEnd) {
    return 1 - (t - shrinkStart) / shrinkDuration;
  }
  return 0;
};

/**
 * 20s cycle:
 * ┌─────────────┬─────────────────┬──────────────────┐
 * │ phase       │ seed=0 (delta)  │ seed=1 (delta)   │
 * ├─────────────┼─────────────────┼──────────────────┤
 * │ growStart   │   0.00 ( 0.00)  │  3.00  ( 3.00)   │
 * │ growEnd     │   6.66 ( 6.66)  │ 16.33  (13.33)   │
 * │ shrinkStart │  16.00 ( 9.33)  │ 17.66  ( 1.33)   │
 * │ shrinkEnd   │  20.00 ( 4.00)  │ 20.00  ( 2.33)   │
 * └─────────────┴─────────────────┴──────────────────┘
 * 15s cycle:
 * ┌─────────────┬─────────────────┬──────────────────┐
 * │ phase       │ seed=0 (delta)  │ seed=1 (delta)   │
 * ├─────────────┼─────────────────┼──────────────────┤
 * │ growStart   │   0.00 ( 0.00)  │  2.25  ( 2.25)   │
 * │ growEnd     │   5.00 ( 5.00)  │ 12.25  (10.00)   │
 * │ shrinkStart │  12.00 ( 7.00)  │ 13.25  ( 1.00)   │
 * │ shrinkEnd   │  15.00 ( 3.00)  │ 15.00  ( 1.75)   │
 * └─────────────┴─────────────────┴──────────────────┘
 */
