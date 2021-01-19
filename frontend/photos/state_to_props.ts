import { BotState } from "../devices/interfaces";
import {
  maybeGetTimeSettings, selectAllFarmwareEnvs, selectAllImages,
} from "../resources/selectors";
import { Everything } from "../interfaces";
import {
  getEnv, saveOrEditFarmwareEnv, generateFarmwareDictionary,
} from "../farmware/state_to_props";
import { JobProgress, TaggedImage } from "farmbot";
import { getStatus } from "../connectivity/reducer_support";
import { prepopulateEnv } from "./remote_env/selectors";
import { getWebAppConfigValue } from "../config_storage/actions";
import { chain } from "lodash";
import { betterCompact } from "../util";
import { ResourceIndex } from "../resources/interfaces";
import { DesignerPhotosProps } from "./interfaces";

export const getImageJobs =
  (allJobs: BotState["hardware"]["jobs"]): JobProgress[] => {
    const jobs = allJobs || {};
    const imageJobNames = Object.keys(jobs).filter(x => x != "FBOS_OTA");
    const imageJobs: JobProgress[] =
      chain(betterCompact(imageJobNames.map(x => jobs[x])))
        .sortBy("time")
        .reverse()
        .value();
    return imageJobs;
  };

const getImages = (ri: ResourceIndex): TaggedImage[] =>
  chain(selectAllImages(ri))
    .sortBy(x => x.body.id)
    .reverse()
    .value();

const getCurrentImage = (
  images: TaggedImage[],
  currentImageUuid: string | undefined,
): TaggedImage | undefined => {
  const latestImage = images[0];
  const currentImage = images.filter(i => i.uuid === currentImageUuid)[0];
  return currentImage || latestImage;
};

export const mapStateToProps = (props: Everything): DesignerPhotosProps => {
  const images = getImages(props.resources.index);
  const env = getEnv(props.resources.index);

  const versions: Record<string, string> = {};
  Object.entries(generateFarmwareDictionary(props.bot, props.resources.index))
    .map(([farmwareName, manifest]) =>
      versions[farmwareName] = manifest.meta.version);

  const currentImageUuid = props.resources.consumers.photos.currentImage;
  const { currentImageSize } = props.resources.consumers.photos;
  const {
    hiddenImages, shownImages, hideUnShownImages, alwaysHighlightImage,
  } = props.resources.consumers.farm_designer;

  return {
    timeSettings: maybeGetTimeSettings(props.resources.index),
    botToMqttStatus: getStatus(props.bot.connectivity.uptime["bot.mqtt"]),
    wDEnv: prepopulateEnv(env),
    env,
    userEnv: props.bot.hardware.user_env,
    farmwareEnvs: selectAllFarmwareEnvs(props.resources.index),
    dispatch: props.dispatch,
    currentImage: getCurrentImage(images, currentImageUuid),
    currentImageSize,
    images,
    syncStatus: props.bot.hardware.informational_settings.sync_status,
    saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
    imageJobs: getImageJobs(props.bot.hardware.jobs),
    versions,
    hiddenImages,
    shownImages,
    hideUnShownImages,
    alwaysHighlightImage,
    getConfigValue: getWebAppConfigValue(() => props),
    farmwares: generateFarmwareDictionary(props.bot, props.resources.index),
  };
};
