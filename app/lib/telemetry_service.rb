# A singleton that runs on a separate process than the web server.
# Listens to *ALL* incoming logs and stores them to the DB.
# Also handles throttling.
class TelemetryService < AbstractServiceRunner
  T = ThrottlePolicy::TimePeriod
  THROTTLE_POLICY = ThrottlePolicy.new T.new(1.minute) => 0.5 * 1_000,
                                       T.new(1.hour) => 0.5 * 10_000,
                                       T.new(1.day) => 0.5 * 100_000

  def process(delivery_info, payload)
    device_key = delivery_info.routing_key.split(".")[1]
    json = JSON.parse(payload)
    other_stuff = { device: device_key,
                    is_telemetry: true,
                    message: "TELEMETRY MESSAGE FROM #{device_key}" }
    puts json.merge(other_stuff).to_json
  end
end
