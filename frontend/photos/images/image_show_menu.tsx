import React from "react";
import { every } from "lodash";
import { t } from "../../i18next_wrapper";
import { highlightMapImage } from "./actions";
import { toggleHideImage } from "../photo_filter_settings/actions";
import {
  FlagDisplayRowProps, ImageFilterProps, ImageShowFlags, ImageShowProps,
} from "./interfaces";

const shownInMapGen = (flags: ImageShowFlags) =>
  every(Object.values(flags).map(f => f.value));

export const ImageShowMenuTarget = (props: ImageFilterProps) => {
  const shownInMap = shownInMapGen(props.flags);
  return <i
    className={shownInMap
      ? "fa fa-eye green fb-icon-button"
      : "fa fa-eye-slash gray fb-icon-button"}
    onMouseEnter={() => shownInMap &&
      props.dispatch(highlightMapImage(props.image?.body.id))}
    onMouseLeave={() => shownInMap &&
      props.dispatch(highlightMapImage(undefined))}
    title={shownInMap ? t("in map") : t("not in map")} />;
};

export const ImageShowMenu = (props: ImageShowProps) =>
  <div className={"image-show-menu"}>
    <ShownInMapDetails {...props} />
    <HideImage {...props} />
  </div>;

const ShownInMapDetails = (props: ImageShowProps) => {
  const { dispatch, image, flags } = props;
  const shownInMap = shownInMapGen(flags);
  return <div className={`shown-in-map-details ${shownInMap ? "shown" : ""}`}
    onMouseEnter={() => shownInMap && dispatch(highlightMapImage(image?.body.id))}
    onMouseLeave={() => shownInMap && dispatch(highlightMapImage(undefined))}>
    <label>
      {shownInMap
        ? t("shown in map")
        : t("not shown in map")}
    </label>
    <FlagDisplayRow flag={flags.layerOn.value}
      title={flags.layerOn.reason}
      labelOk={t("Map photo layer on")}
      labelNo={t("Map photo layer off")} />
    <FlagDisplayRow flag={flags.inRange.value}
      title={flags.inRange.reason}
      labelOk={t("Within filter range")}
      labelNo={t("Outside of filter range")} />
    <FlagDisplayRow flag={flags.zMatch.value}
      title={flags.zMatch.reason}
      labelOk={t("Z height matches calibration")}
      labelNo={t("Z doesn't match calibration")} />
    <FlagDisplayRow flag={flags.sizeMatch.value}
      title={flags.sizeMatch.reason}
      labelOk={t("Size matches camera calibration")}
      labelNo={t("Size doesn't match calibration")} />
    <FlagDisplayRow flag={flags.notHidden.value}
      title={flags.notHidden.reason}
      labelOk={t("Not hidden")}
      labelNo={t("Temporarily hidden")} />
    <FlagDisplayRow flag={flags.typeShown.value}
      title={flags.typeShown.reason}
      labelOk={t("Type not filtered")}
      labelNo={t("Type filtered")} />
  </div>;
};

const FlagDisplayRow = (props: FlagDisplayRowProps) =>
  <div className={"image-flag-display"} title={props.title}>
    {props.flag
      ? <i className={"fa fa-check-circle green"} />
      : <i className={"fa fa-times-circle gray"} />}
    <p>{props.flag ? t(props.labelOk) : t(props.labelNo)}</p>
  </div>;

const HideImage =
  ({ flags, image, dispatch }: ImageFilterProps) =>
    <div className={"hide-single-image-section"}>
      <div className={"content"}>
        <button
          className={"fb-button yellow"}
          disabled={!(flags.zMatch.value && flags.inRange.value)}
          title={flags.notHidden.value ? t("hide") : t("show")}
          onClick={() => image?.body.id
            && dispatch(toggleHideImage(flags.notHidden.value, image.body.id))}>
          {flags.notHidden.value ? t("hide") : t("show")}
        </button>
        <p>
          {flags.notHidden.value
            ? t("this photo from map")
            : t("this photo in map")}
        </p>
        <p className={"header-label"}>{t("(resets upon refresh)")}</p>
      </div>
    </div>;
