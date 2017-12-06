Transport
  .log_channel
  .subscribe(block: true) do |delivery_info, properties, payload|
    # # Legacy FBOS still uses the API for log storage.
    # headers    = properties[:headers] || {}
    # # Guess version
    # not_legacy = !headers.keys.join(" ").include?("mqtt")
    # if (not_legacy)
      # Extract current user (if version is appropriate)
      # device_id = delivery_info.routing_key.split(".")[1].gsub("device_", "").to_i
      # device    = Device.find(device_id)
      # # Parse payload
      # payload   = JSON.parse(payload)

      # # {"meta"=>{"z"=>0, "y"=>0, "x"=>0, "type"=>"info"}, "message"=>"HQ FarmBot TEST 123 Pin 13 is 0", "created_at"=>1512585641, "channels"=>[]}

      # puts "===== INCOMING LOG ====="
      # puts payload
    # end
  end
