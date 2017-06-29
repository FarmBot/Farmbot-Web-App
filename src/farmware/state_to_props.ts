import { Everything } from "../interfaces";
import { selectAllImages } from "../resources/selectors";
import { FarmwareProps } from "../devices/interfaces";
import { prepopulateEnv } from "../images/weed_detector/remote_env/selectors";

export function mapStateToProps(props: Everything): FarmwareProps {
  let images = _(selectAllImages(props.resources.index))
    .sortBy(x => x.body.id)
    .reverse()
    .value();

  let currentImage = images
    .filter(i => i.uuid === props.resources.consumers.farmware.currentImage)[0];
  let { farmwares } = props.bot.hardware.process_info;
  let syncStatus = props
    .bot
    .hardware
    .informational_settings
    .sync_status || "unknown";
  return {
    farmwares,
    syncStatus,
    env: prepopulateEnv(props.bot.hardware.user_env),
    dispatch: props.dispatch,
    currentImage,
    images
  };
}

