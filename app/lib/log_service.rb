# A singleton that runs on a separate process than the web server.
# Listens to *ALL* incoming logs and stores them to the DB.
# Also handles throttling.
class LogService < AbstractServiceRunner
  T = ThrottlePolicy::TimePeriod
  THROTTLE_POLICY = ThrottlePolicy.new T.new(1.minute) => 0.5 * 1_000,
                                       T.new(1.hour) => 0.5 * 10_000,
                                       T.new(1.day) => 0.5 * 100_000

  LOG_TPL = Rails.env.test? ?
    "\e[32m.\e[0m" : "FBOS LOG (device_%s): %s\n"
  ERR_TPL = "MALFORMED LOG CAPTURE: %s"

  def process(delivery_info, payload)
    params = { routing_key: delivery_info.routing_key, payload: payload }
    m = AmqpLogParser.run!(params)
    THROTTLE_POLICY.track(m.device_id)
    maybe_deliver(m)
  rescue Mutations::ValidationException => e
    msg = ERR_TPL % [params.merge({ e: e }).to_json]
    puts msg unless Rails.env.test?
    raise e
  end

  def maybe_deliver(data)
    violation = THROTTLE_POLICY.is_throttled(data.device_id)
    ok = data.valid? && !violation

    data.device.auto_sync_transaction do
      ok ? deliver(data) : warn_user(data, violation)
    end
  end

  def deliver(data)
    dev, log = [data.device, data.payload]
    dev.maybe_unthrottle
    Log.deliver(dev, Logs::Create.run!(log, device: dev))
    print LOG_TPL % [data.device_id, data.payload["message"] || "??"]
  rescue => x
    Rollbar.error(x)
  end

  def warn_user(data, violation)
    data.device.maybe_throttle(violation)
  end
end
