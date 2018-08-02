import axios from "axios";
import { API } from "../../api";
import { success } from "farmbot-toastr";
import { t } from "i18next";

export const snapshotGarden = (name?: string | undefined) =>
  axios.post<void>(API.current.snapshotPath, name ? { name } : {})
    .then(() => success(t("Garden Saved.")));
