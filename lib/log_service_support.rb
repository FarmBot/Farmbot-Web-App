class LogService
  def self.process(delivery_info, payload)
    # { "meta"=>{"z"=>0, "y"=>0, "x"=>0, "type"=>"info", "major_version"=>6},
    #   "message"=>"HQ FarmBot TEST 123 Pin 13 is 0",
    #   "created_at"=>1512585641,
    #   "channels"=>[] }
    log           = JSON.parse(payload)

    # Legacy bots will double save logs if we don't do this:
    major_version = (log.dig("meta", "major_version") || 0).to_i

    if(major_version >= 6)
      device_id = delivery_info.routing_key.split(".")[1].gsub("device_", "").to_i
      log[:device] = Device.find(device_id)
      Logs::Create.run!(log).save!
    else
      puts "Ignoring legacy log."
    end
  end
end
