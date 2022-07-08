# A singleton that runs on a separate process than the web server.
# Listens to *ALL* incoming telemetry and selectively stores them to the DB.
# Also handles throttling.
class TelemetryService < AbstractServiceRunner
  NO_VERSION = "0.0.0"
  MESSAGE = "TELEMETRY MESSAGE FROM device_%s %s"
  FAILURE = "FAILED TELEMETRY MESSAGE FROM %s"
  THROTTLE_POLICY = ThrottlePolicy.new(name, min: 25,
                                             hour: 250,
                                             day: 1500)
  # Clean up excess telemetry in a non-deterministic manner.
  # Performs the slow DB query every nth request.
  TIDY_RATE = Rails.env.test? ? 0 : 10

  def process(delivery_info, payload)
    params = { routing_key: delivery_info.routing_key, payload: payload }
    m = AmqpTelemetryParser.run!(params)
    device_key = "device_#{m.device_id}"
    THROTTLE_POLICY.track(device_key)
    m.device.trim_excess_telemetry if rand(0..TIDY_RATE) == TIDY_RATE
    maybe_deliver(m, payload)
  rescue Mutations::ValidationException => e
    msg = ({ device: device_key,
             is_telemetry: true,
             bad_json: payload,
             message: FAILURE % device_key }).to_json
    puts msg unless Rails.env.test?
    raise e
  end

  def maybe_deliver(data, original_payload)
    return unless data.valid?

    violation = THROTTLE_POLICY.violation_for("device_#{data.device_id}")

    if violation
      return
    end

    data.device.auto_sync_transaction do
      deliver(data, original_payload)
    end
  end

  def deliver(data, original_payload)
    dev, dev_telemetry = [data.device, data.payload]
    device_version = dev.fbos_version || NO_VERSION
    telemetry = dev_telemetry.merge({
      fbos_version: device_version,
      firmware_hardware: dev.fbos_config.firmware_hardware,
    })
    Telemetries::Create.run!(telemetry, device: dev)
    msg = (MESSAGE % [data.device_id, device_version])
    other_stuff = { device: "device_#{data.device_id}",
                    is_telemetry: true,
                    message: msg }
    puts JSON.parse(original_payload).merge(other_stuff).to_json
  rescue => x
    Rollbar.error(x)
  end
end
