# A singleton that runs on a separate process than the web server.
# Listens to *ALL* incoming logs and stores them to the DB.
# Also handles throttling.
class TelemetryService < AbstractServiceRunner
  NO_VERSION = "0.0.0"
  MESSAGE = "TELEMETRY MESSAGE FROM %s %s"
  FAILURE = "FAILED TELEMETRY MESSAGE FROM %s"
  THROTTLE_POLICY = ThrottlePolicy.new(name, min: 25,
                                             hour: 250,
                                             day: 1500)

  def process(delivery_info, payload)
    device_key = delivery_info
      .routing_key
      .split(".")[1]
    json = JSON.parse(payload)
    msg = (MESSAGE % [device_key, get_version(device_key)])
    other_stuff = { device: device_key,
                    is_telemetry: true,
                    message: msg }
    THROTTLE_POLICY.track(device_key)
    violation = THROTTLE_POLICY.violation_for(device_key)
    unless violation
      puts json.merge(other_stuff).to_json
    end
  rescue JSON::ParserError
    puts ({ device: device_key,
            is_telemetry: true,
            bad_json: payload,
            message: FAILURE % device_key }).to_json
  end

  def get_version(device_key)
    id = device_key.gsub("device_", "").to_i
    ver = Device.select(:fbos_version).limit(1).find_by(id: id)&.fbos_version
    ver || NO_VERSION
  end
end
