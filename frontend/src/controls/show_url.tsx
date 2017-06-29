import * as React from "react";
import { FallbackImg } from "../ui/fallback_img";
import { PLACEHOLDER_FARMBOT } from "../images/index";
import { t } from "i18next";

export const showUrl = (url: string, dirty: boolean) => {
  if (dirty) {
    return <p>{t("Press save to view.")}</p>;
  } else {
    if (url.includes(PLACEHOLDER_FARMBOT)) {
      return <div className="webcam-stream-unavailable">
        <FallbackImg className="webcam-stream"
          src={url}
          fallback={PLACEHOLDER_FARMBOT} />
        <text>
          {t("Camera stream not available.")}
          <br />
          {t("Press ")}<b>{t("EDIT")}</b>{t(" to add a stream.")}
        </text>
      </div>;
    } else {
      return <FallbackImg className="webcam-stream"
        src={url}
        fallback={PLACEHOLDER_FARMBOT} />;
    };
  };
};
