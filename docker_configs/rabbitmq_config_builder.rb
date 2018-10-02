require 'erb'

def needs_admin_password
  raise "You must set an ADMIN_PASSWORD in `.env`."
end

puts "=== Setting config data"
CONFIG_PATH     = "./docker_configs"
CONFIG_FILENAME = "rabbitmq.conf"
CONFIG_OUTPUT   = "#{CONFIG_PATH}/#{CONFIG_FILENAME}"
NO_API_HOST     = "\nYou MUST set API_HOST to a real IP address or " +
                  "domain name (not localhost).\n" +
                  "API_PORT is also mandatory."
TEMPLATE_FILE   = "./docker_configs/rabbitmq.conf.erb"
TEMPLATE        = File.read(TEMPLATE_FILE)
RENDERER        = ERB.new(TEMPLATE)
PROTO           = ENV["FORCE_SSL"] ? "https:" : "http:"
VHOST           = ENV.fetch("MQTT_VHOST") { "/" }
admin_password  = ENV.fetch("ADMIN_PASSWORD")  { needs_admin_password }

needs_admin_password if admin_password.length < 5

fully_formed_url = PROTO + $API_URL

if !ENV["API_HOST"] || !ENV["API_PORT"]
  puts NO_API_HOST
  exit
end
ok = RENDERER.result(binding)
# Write the config file.
File.write(CONFIG_OUTPUT, ok)
puts ok
