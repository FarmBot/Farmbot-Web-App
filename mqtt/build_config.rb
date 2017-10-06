require 'erb'

# Hardcoded stuff.
CONFIG_PATH     = "./mqtt/conf"
CONFIG_FILENAME = "rabbitmq.config"
CONFIG_OUTPUT   = "#{CONFIG_PATH}/#{CONFIG_FILENAME}"
NO_MQTT_HOST    = "You need to set MQTT_HOST to a real IP address or domain " +
                  "name (not localhost)."
TEMPLATE_FILE   = "./mqtt/rabbitmq.config.erb"
TEMPLATE        = File.read(TEMPLATE_FILE)
RENDERER        = ERB.new(TEMPLATE)

# User definable stuff.
PROTO = ENV["FORCE_SSL"] ? "http://" : "https://"
HOST  = ENV.fetch("MQTT_HOST") { exit NO_MQTT_HOST }
VHOST = ENV.fetch("MQTT_VHOST") { "/" }

# Prepare information to be render
farmbot_api_key_url = "#{PROTO}#{HOST}/api/public_key"
farmbot_vhost       = VHOST

# Write the config file.
File.write(CONFIG_OUTPUT, RENDERER.result(binding))
