
export namespace DevSettings {

  export const FUTURE_FE_FEATURES = "FUTURE_FEATURES";
  /** Unstable FE features enabled? */
  export const futureFeaturesEnabled = () =>
    !!localStorage.getItem(FUTURE_FE_FEATURES);
  /** Show unstable FE features for development purposes. */
  export const enableFutureFeatures = () =>
    localStorage.setItem(FUTURE_FE_FEATURES, "true");
  export const disableFutureFeatures = () =>
    localStorage.removeItem(FUTURE_FE_FEATURES);

  export const FBOS_VERSION_OVERRIDE = "IM_A_DEVELOPER";
  export const MAX_FBOS_VERSION_OVERRIDE = "1000.0.0";
  /**
   * Escape hatch for platform developers doing offline development.
   * Use `setFbosVersionOverride` or `setMaxFbosVersionOverride`
   * to adjust override level.
   */
  export const overriddenFbosVersion = () =>
    localStorage.getItem(FBOS_VERSION_OVERRIDE);
  export const resetFbosVersionOverride = () =>
    localStorage.removeItem(FBOS_VERSION_OVERRIDE);
  export const setFbosVersionOverride = (override: string) =>
    localStorage.setItem(FBOS_VERSION_OVERRIDE, override);
  export const setMaxFbosVersionOverride = () =>
    localStorage.setItem(FBOS_VERSION_OVERRIDE, MAX_FBOS_VERSION_OVERRIDE);

}
