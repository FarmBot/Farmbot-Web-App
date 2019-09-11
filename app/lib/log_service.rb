# A singleton that runs on a separate process than the web server.
# Listens to *ALL* incoming logs and stores them to the DB.
# Also handles throttling.
class LogService < AbstractServiceRunner
  T = ThrottlePolicy::TimePeriod
  THROTTLE_POLICY = ThrottlePolicy.new T.new(1.minute) => 0.5 * 1_000,
                                       T.new(1.hour) => 0.5 * 10_000,
                                       T.new(1.day) => 0.5 * 100_000

  LOG_TPL = "FBOS LOG (device_%s): %s"
  ERR_TPL = "LOG ERROR: %s"

  def process(delivery_info, payload)
    params = { routing_key: delivery_info.routing_key, payload: payload }
    m = AmqpLogParser.run!(params)
    if Rails.env.production?
      puts LOG_TPL % [m.device_id, m.payload["message"]]
    end
    THROTTLE_POLICY.track(m.device_id)
    maybe_deliver(m)
  rescue Mutations::ValidationException => e
    puts ERR_TPL % [params.merge({ e: e }).to_json]
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
  rescue => x
    Rollbar.error(x)
  end

  def warn_user(data, violation)
    data.device.maybe_throttle(violation)
  end
end
