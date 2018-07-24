require 'erb'
puts "\n" * 10
puts "=== THIS IS A LEGACY BROKER. DONT USE THIS UNLESS YOU HAVE A GOOD REASON."
puts "\n" * 10
puts "=== Retrieving container info"
PLUGIN_PATH     ||= "mqtt_legacy/jwt_plugin/plugins/rabbit_auth_backend*"
PLUGIN_IS_BUILT ||= Dir[PLUGIN_PATH].any?
FORCE_REBUILD   ||= ENV["FORCE_REBUILD"].present?
DOCKER_IMG_NAME ||= "farmbot-mqtt-legacy"
IMG_IS_BUILT    ||= `cd mqtt_legacy; sudo docker images`.include?(DOCKER_IMG_NAME)

puts "=== Setting config data"
CONFIG_PATH     ||= "./mqtt_legacy"
CONFIG_FILENAME ||= "rabbitmq.config"
CONFIG_OUTPUT   ||= "#{CONFIG_PATH}/#{CONFIG_FILENAME}"
NO_API_HOST     ||= "\nYou MUST set API_HOST to a real IP address or " +
                  "domain name (not localhost).\n" +
                  "API_PORT is also mandatory."
TEMPLATE_FILE   ||= "./mqtt_legacy/rabbitmq.config.erb"
TEMPLATE        ||= File.read(TEMPLATE_FILE)
RENDERER        ||= ERB.new(TEMPLATE)
PROTO           ||= ENV["FORCE_SSL"] ? "https:" : "http:"
VHOST           ||= ENV.fetch("MQTT_VHOST") { "/" }

if !ENV["API_HOST"] || !ENV["API_PORT"]
  puts NO_API_HOST
  exit
end

puts "=== Building JWT plugin config"
farmbot_api_key_url = ENV.fetch("API_PUBLIC_KEY_PATH") do
  "#{PROTO}#{$API_URL}/api/public_key"
end

# Write the config file.
conf = RENDERER.result(binding)
file = CONFIG_OUTPUT

File.write(file, conf)

# Re-init docker stuff

processes = `sudo docker ps -a -f "name=farmbot-mqtt-legacy" -q`

if processes.present?
  puts "=== Stopping pre-existing farmbot containers"
  sh "cd mqtt_legacy && sudo docker stop #{processes}"
  sh "cd mqtt_legacy && sudo docker rm #{processes}"
end

if IMG_IS_BUILT
  puts "=== Destroying old docker images"
  sh "cd mqtt_legacy; sudo docker rmi #{DOCKER_IMG_NAME} --force"
end

puts "=== Building docker image"
sh "cd mqtt_legacy; sudo docker build -t farmbot-mqtt-legacy ."

puts "=== Starting MQTT"

exec [
  'cd mqtt_legacy;',
  'sudo docker run',
  '-p "5672:5672"',  # AMQP (RabbitMQ)
  '-p "1883:1883"',  # MQTT
  '-p "8883:8883"',  # MQTT over TLS/SSL
  '-p "3002:15675"', # MQTT over WebSockets
  '--name "farmbot-mqtt-legacy"',
  'farmbot-mqtt-legacy'
].join(" ")
