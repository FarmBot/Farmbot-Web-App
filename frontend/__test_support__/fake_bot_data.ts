import { BytesProgress, JobProgress, PercentageProgress } from "farmbot";
import { BotLocationData } from "../devices/interfaces";
import { BotSize } from "../farm_designer/map/interfaces";

export const fakeBotSize = (): BotSize => ({
  x: { value: 2900, isDefault: false },
  y: { value: 1400, isDefault: false },
  z: { value: 400, isDefault: true },
});

export const fakeBotLocationData = (): BotLocationData => ({
  position: { x: undefined, y: undefined, z: undefined },
  scaled_encoders: { x: undefined, y: undefined, z: undefined },
  raw_encoders: { x: undefined, y: undefined, z: undefined },
});

export const fakeBytesJob =
  (update?: Partial<BytesProgress>): JobProgress => ({
    status: "working",
    unit: "bytes",
    bytes: 99,
    type: "ota",
    file_type: ".fw",
    time: "2017-09-03T20:01:40.336Z",
    ...update,
  });

export const fakePercentJob =
  (update?: Partial<PercentageProgress>): JobProgress => ({
    status: "working",
    unit: "percent",
    percent: 99,
    type: "ota",
    file_type: ".fw",
    time: "2017-09-03T20:01:40.336Z",
    ...update,
  });
