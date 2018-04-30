import { API } from "../api";
import { Content } from "../constants";
import { success } from "farmbot-toastr";
import { t } from "i18next";
import axios from "axios";

const ok = () => success(t(Content.EXPORT_SENT));

export const requestAccountExport =
  () => axios.post(API.current.exportDataPath).then(ok);
