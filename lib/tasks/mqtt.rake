namespace :mqtt do
  desc "Bootstraps the MQTT config file. To force a rebuild of *everything*, " +
       "set FORCE_REBUILD='true'"
  task start: :environment do
    require_relative '../../mqtt/server.rb'
  end
end
