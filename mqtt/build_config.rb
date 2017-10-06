require 'erb'
puts "=== Retrieving container info"
DOCKER_IMG_NAME     = "farmbot-mqtt"
IS_BUILT            = `cd mqtt; sudo docker images`.include?(DOCKER_IMG_NAME)
IS_RUNNING          = `cd mqtt; sudo docker container ls`.include?(DOCKER_IMG_NAME)

puts "=== Setting config data"
CONFIG_PATH         = "./mqtt/conf"
CONFIG_FILENAME     = "rabbitmq.config"
CONFIG_OUTPUT       = "#{CONFIG_PATH}/#{CONFIG_FILENAME}"
NO_MQTT_HOST        = "You need to set MQTT_HOST to a real IP address or " +
                      "domain name (not localhost)."
TEMPLATE_FILE       = "./mqtt/rabbitmq.config.erb"
TEMPLATE            = File.read(TEMPLATE_FILE)
RENDERER            = ERB.new(TEMPLATE)
PROTO               = ENV["FORCE_SSL"] ? "http://" : "https://"
HOST                = ENV.fetch("MQTT_HOST") { exit NO_MQTT_HOST }
VHOST               = ENV.fetch("MQTT_VHOST") { "/" }

puts "=== Building JWY plugin config"
farmbot_api_key_url = "#{PROTO}#{HOST}/api/public_key"
farmbot_vhost       = VHOST

# Write the config file.
File.write(CONFIG_OUTPUT, RENDERER.result(binding))

# Re-init docker stuff
if IS_RUNNING
  puts "=== Stopping running docker containers"
  `cd mqtt; sudo docker rm farmbot-mqtt --force`
end

if IS_BUILT
  puts "=== Destroying old docker images"
  `cd mqtt; sudo docker rmi #{DOCKER_IMG_NAME} --force`
end


puts "=== Building docker image"
`cd mqtt; sudo docker build -t farmbot-mqtt .`
