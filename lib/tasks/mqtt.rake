namespace :mqtt do
  desc "Bootstraps the MQTT config file"
  task setup: :environment do
    require_relative '../../mqtt/build_config.rb'
  end

end
