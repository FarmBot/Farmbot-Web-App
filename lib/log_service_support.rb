class LogService
  def self.save?(log_as_ruby_hash)
    t = (log_as_ruby_hash || {}).dig("meta", "type")
    !!(t && !Log::DISCARD.include?(t))
  end

  # Prevent logs table from growing out of proportion. For now, it is
  # randomly to every third request for performance.
  def self.maybe_clear_logs(device)
    logs    = Log.where(device_id: device.id)
    limit   = device.max_log_count || Device::DEFAULT_MAX_LOGS
    current = logs.count
    logs
      .order(created_at: :desc)
      .last(current - limit)
      .map(&:destroy) if current > limit
  end

  def self.process(delivery_info, payload)
    # { "meta"=>{"z"=>0, "y"=>0, "x"=>0, "type"=>"info", "major_version"=>6},
    #   "message"=>"HQ FarmBot TEST 123 Pin 13 is 0",
    #   "created_at"=>1512585641,
    #   "channels"=>[] }
    log           = JSON.parse(payload)

    # Legacy bots will double save logs if we don't do this:
    major_version = (log.dig("meta", "major_version") || 0).to_i
    puts log["message"] if Rails.env.production?
    if(major_version >= 6)
      device_id = delivery_info.routing_key.split(".")[1].gsub("device_", "").to_i
      if save?(log)
        device = Device.find(device_id)
        db_log = Logs::Create.run!(log, device: device)
        db_log.save!
        maybe_clear_logs(device)
        LogDispatch.deliver(device, db_log)
      end
    end
  end
end
