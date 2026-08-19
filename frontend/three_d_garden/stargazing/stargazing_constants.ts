export const STARGAZING_MIN_FOV = 20;
export const STARGAZING_MAX_FOV = 90;
export const STARGAZING_DEFAULT_FOV = STARGAZING_MIN_FOV;

export const clampStargazingFov = (fov: number) =>
  Math.max(STARGAZING_MIN_FOV, Math.min(STARGAZING_MAX_FOV, fov));
