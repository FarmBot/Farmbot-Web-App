namespace :mqtt do
  desc "Bootstraps the MQTT config file. To force a rebuild of *everything*, " +
       "set FORCE_REBUILD='true'"
  task start: :environment do
    begin
      require_relative '../../mqtt/server.rb'
    rescue Errno::ECONNREFUSED => e
      puts "API is not up yet. Waiting 5 seconds..."
      sleep 5
      retry
    end
  end

  desc "Bootstraps the old MQTT server"
  task legacy_start: :environment do
    begin
      require_relative '../../mqtt_legacy/server.rb'
    rescue Errno::ECONNREFUSED
      puts "API is not up yet. Waiting 5 seconds..."
      sleep 5
      retry
    end
  end
end
