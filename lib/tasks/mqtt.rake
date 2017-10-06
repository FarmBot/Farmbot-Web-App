namespace :mqtt do
  desc "Bootstraps the MQTT config file"
  task start: :environment do
    require_relative '../../mqtt/server.rb'
  end
end
