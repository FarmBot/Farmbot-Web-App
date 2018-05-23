# A singleton that runs on a seperate process than the web server.
# Listens to *ALL* incoming logs and stores them to the DB.
# Also handles throttling.
class LogService
  T = ThrottlePolicy::Throttler
  THROTTLE_POLICY  = ThrottlePolicy.new T.new(1.minute) => 0.5 * 1_000,
                                        T.new(1.hour)   => 0.5 * 10_000,
                                        T.new(1.day)    => 0.5 * 100_000

  def self.process(delivery_info, payload)
    params = { routing_key: delivery_info.routing_key, payload: payload }
    data   = AmqpLogParser.run!(params)
    puts data.payload["message"] if Rails.env.production?
    THROTTLE_POLICY.track(data.device_id)
    maybe_deliver(data)
  end

  def self.maybe_deliver(data)
    violation = THROTTLE_POLICY.is_throttled(data.device_id)
    ok        = data.valid? && !violation

    data.device.auto_sync_transaction do
      ok ? deliver(data) : warn_user(data, violation)
    end
  end

  def self.deliver(data)
    dev, log = [data.device, data.payload]
    dev.maybe_unthrottle
    LogDispatch.deliver(dev, Logs::Create.run!(log, device: dev))
  end

  def self.warn_user(data, violation)
    data.device.maybe_throttle(violation)
  end
end
