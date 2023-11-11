import { SpecialStatus, TaggedTelemetry } from "farmbot";
import { random, range } from "lodash";

export const generateDemoTelemetry = (): TaggedTelemetry[] => {
  const count = 100;
  return range(count).map(n => {
    const up = n / count * 24 * 60 * 60;
    const at = (new Date()).valueOf() / 1000 - 24 * 60 * 60 + up;
    return {
      kind: "Telemetry",
      uuid: `Telemetry.${n}.${n}`,
      specialStatus: SpecialStatus.SAVED,
      body: {
        id: n + 1,
        soc_temp: 40,
        throttled: "0x0",
        wifi_level_percent: 80 + random(-8, 8),
        uptime: up,
        memory_usage: 50 + random(-5, 5),
        disk_usage: 1,
        cpu_usage: 5 + random(-4, 4),
        target: "demo",
        fbos_version: "100.0.0",
        firmware_hardware: "farmduino_k17",
        created_at: at,
        updated_at: (new Date(at)).toISOString(),
      }
    };
  });
};
