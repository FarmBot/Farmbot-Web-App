import React from "react";
import { round } from "lodash";
import { t } from "../../i18next_wrapper";
import { ImageFilterProps } from "../images/interfaces";
import { filterTime } from "./util";
import { FilterNearTimeState } from "./interfaces";
import { setWebAppConfigValues } from "./actions";

export class FilterNearTime
  extends React.Component<ImageFilterProps, FilterNearTimeState> {
  state: FilterNearTimeState = { seconds: 60 };
  render() {
    const { dispatch, image, flags } = this.props;
    return <div className={"this-image-section"}>
      <div className={"content"}>
        <p>{t("show only photos taken within")}</p>
        <input type="number"
          value={round(this.state.seconds / 60)}
          onChange={e =>
            this.setState({ seconds: parseFloat(e.currentTarget.value) * 60 })} />
        <p>{t("minutes of")}</p>
        <button
          className={"fb-button yellow"}
          disabled={!(flags.zMatch && flags.notHidden)}
          title={t("this photo")}
          onClick={() => image && dispatch(setWebAppConfigValues({
            photo_filter_begin: filterTime("before", this.state.seconds)(image),
            photo_filter_end: filterTime("after", this.state.seconds)(image),
          }))}>
          {t("this photo")}
        </button>
        <p>{t("in map")}</p>
      </div>
    </div>;
  }
}
