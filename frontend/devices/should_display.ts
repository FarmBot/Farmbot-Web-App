import { store } from "../redux/store";
import { ResourceIndex } from "../resources/interfaces";
import { maybeGetDevice } from "../resources/selectors";
import { DevSettings } from "../settings/dev/dev_support";
import { createShouldDisplayFn, determineInstalledOsVersion } from "../util";
import { BotState, Feature } from "./interfaces";

export const getShouldDisplayFn = (ri: ResourceIndex, bot: BotState) => {
  const lookupData = bot.minOsFeatureData;
  const installed = determineInstalledOsVersion(bot, maybeGetDevice(ri));
  const override = DevSettings.overriddenFbosVersion();
  const shouldDisplay = createShouldDisplayFn(installed, lookupData, override);
  return shouldDisplay;
};

export const shouldDisplayFeature = (feature: Feature) => {
  const { resources, bot } = store.getState();
  const shouldDisplay = getShouldDisplayFn(resources.index, bot);
  return shouldDisplay(feature);
};
