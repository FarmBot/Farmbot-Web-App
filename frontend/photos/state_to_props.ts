import { BotState } from "../devices/interfaces";
import { maybeGetTimeSettings, selectAllImages } from "../resources/selectors";
import { Everything } from "../interfaces";
import {
  getShouldDisplayFn, getEnv, saveOrEditFarmwareEnv, generateFarmwareDictionary,
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

export const getCurrentImage =
  (images: TaggedImage[], currentImgUuid: string | undefined): TaggedImage => {
    const firstImage = images[0];
    const currentImage =
      images.filter(i => i.uuid === currentImgUuid)[0] || firstImage;
    return currentImage;
  };

export const mapStateToProps = (props: Everything): DesignerPhotosProps => {
  const images = getImages(props.resources.index);
  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);

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
    dispatch: props.dispatch,
    currentImage: getCurrentImage(images, currentImageUuid),
    currentImageSize,
    images,
    syncStatus: props.bot.hardware.informational_settings.sync_status,
    shouldDisplay,
    saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
    imageJobs: getImageJobs(props.bot.hardware.jobs),
    versions,
    hiddenImages,
    shownImages,
    hideUnShownImages,
    alwaysHighlightImage,
    getConfigValue: getWebAppConfigValue(() => props),
  };
};
