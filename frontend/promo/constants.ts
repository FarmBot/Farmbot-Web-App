export enum Season {
  Spring = "Spring",
  Summer = "Summer",
  Fall = "Fall",
  Winter = "Winter",
  Random = "Random",
}

export const SEASONS: string[] = Object.values(Season);

interface SeasonDuration {
  season: string;
  duration: number;
  pause: number;
}

export const SEASON_TIMINGS: SeasonDuration[] = [
  { season: Season.Spring, duration: 17.5, pause: 0 },
  { season: Season.Summer, duration: 20, pause: 0 },
  { season: Season.Fall, duration: 17.5, pause: 0 },
  { season: Season.Winter, duration: 15, pause: 0 },
];

export const SEASON_DURATIONS: Record<string, number> = SEASON_TIMINGS
  .reduce((acc, { season, duration }) => {
    acc[season] = duration;
    return acc;
  }, {} as Record<string, number>);
