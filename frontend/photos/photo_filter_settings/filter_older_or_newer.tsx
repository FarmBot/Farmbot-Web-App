import React from "react";
import { t } from "../../i18next_wrapper";
import { filterTime } from "./util";
import { ImageFilterProps } from "../images/interfaces";
import { setWebAppConfigValues } from "./actions";

export const FilterOlderOrNewer = ({ dispatch, image, flags }: ImageFilterProps) =>
  <div className={"newer-older-images-section"}>
    <p>{t("show only this photo and")}</p>
    <div className={"buttons"}>
      <button
        className={"fb-button yellow"}
        disabled={!(flags.zMatch && flags.notHidden)}
        title={t("older")}
        onClick={() => image && dispatch(setWebAppConfigValues({
          photo_filter_begin: "", photo_filter_end: filterTime("after")(image),
        }))}>
        <i className="fa fa-arrow-left" />
        {t("older")}
      </button>
      <button
        className={"fb-button yellow"}
        disabled={!(flags.zMatch && flags.notHidden)}
        title={t("newer")}
        onClick={() => image && dispatch(setWebAppConfigValues({
          photo_filter_begin: filterTime("before")(image), photo_filter_end: "",
        }))}>
        {t("newer")}
        <i className="fa fa-arrow-right" />
      </button>
    </div>
    <p>{t("photos in map")}</p>
  </div>;
