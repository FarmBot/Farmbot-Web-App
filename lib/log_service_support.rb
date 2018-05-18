class LogService
  THROTTLE_POLICY  = ThrottlePolicy.new(Throttler.new(1.minute) => 1_000,
                                        Throttler.new(1.hour)   => 10_000,
                                        Throttler.new(1.day)    => 100_000)

  # Determines if the log should be discarded (Eg: "fun"/"debug" logs do not
  # go in the DB)
  def self.save?(log_as_ruby_hash)
    # TODO: Once we get rid of legacy `log.meta` calls (FBOS < 6.4.0 EOL),
    # this method can be simplified.
    is_a_hash      = log_as_ruby_hash.is_a?(Hash)
    hash           = is_a_hash ? log_as_ruby_hash : {}
    legacy_type    = hash.dig("meta", "type")
    type           = legacy_type || hash.dig("type")
    should_discard = Log::DISCARD.include?(type)

    !should_discard
  end

  # Calls .work(), but only if thorttle policy requirements are met.
  def self.process(delivery_info, payload)
    device_id = delivery_info.routing_key.split(".")[1].gsub("device_", "").to_i
    if THROTTLE_POLICY.is_throttled(device_id)
      Rollbar.info("#{device_id} is throttled!")
    else
      self.work(delivery_info, payload, device_id)
    end
  end

  def self.work(delivery_info, payload, device_id)
    # { "meta"=>{"z"=>0, "y"=>0, "x"=>0, "type"=>"info", "major_version"=>6},
    #   "message"=>"HQ FarmBot TEST 123 Pin 13 is 0",
    #   "created_at"=>1512585641,
    #   "channels"=>[] }
    log           = JSON.parse(payload)
    primary       = log["major_version"]
    secondary     = log.dig("meta", "major_version") # Legacy
    # Legacy bots will double save logs if we don't do this:
    major_version =  (primary || secondary || 0).to_i
    puts log["message"] if Rails.env.production?
    if (major_version >= 6)
      if save?(log)
        device = Device.find(device_id)
        db_log = Logs::Create.run!(log, device: device)
        LogDispatch.deliver(device, db_log)
      end
    end
  end
end
