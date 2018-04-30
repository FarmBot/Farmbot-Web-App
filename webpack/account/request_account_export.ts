import { success } from "farmbot-toastr";
import axios from "axios";
import { API } from "../api";
import { t } from "i18next";
import { Content } from "../constants";

const ok = () => success(t(Content.EXPORT_SENT));

export const requestAccountExport =
  () => axios.post<void>(API.current.snapshotPath).then(ok);
