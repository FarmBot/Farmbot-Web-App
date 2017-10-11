require 'erb'
puts "=== Retrieving container info"
PLUGIN_PATH         = "mqtt/jwt_plugin/plugins/rabbit_auth_backend*"
PLUGIN_IS_BUILT     = Dir[PLUGIN_PATH].any?
DOCKER_IMG_NAME     = "farmbot-mqtt"
IMG_IS_BUILT        = `cd mqtt; sudo docker images`.include?(DOCKER_IMG_NAME)

puts "=== Setting config data"
CONFIG_PATH         = "./mqtt/conf"
CONFIG_FILENAME     = "rabbitmq.config"
CONFIG_OUTPUT       = "#{CONFIG_PATH}/#{CONFIG_FILENAME}"
NO_API_HOST         = "You need to set API_HOST to a real IP address or " +
                      "domain name (not localhost)."
TEMPLATE_FILE       = "./mqtt/rabbitmq.config.erb"
TEMPLATE            = File.read(TEMPLATE_FILE)
RENDERER            = ERB.new(TEMPLATE)
PROTO               = ENV["FORCE_SSL"] ? "https:" : "http:"
VHOST               = ENV.fetch("MQTT_VHOST") { "/" }

puts "=== Building JWT plugin config"
farmbot_api_key_url = "#{PROTO}#{$API_URL}/api/public_key"
farmbot_vhost       = VHOST

# Write the config file.
File.write(CONFIG_OUTPUT, RENDERER.result(binding))

# Maybe re-build the auth plugin
if !PLUGIN_IS_BUILT
  puts "=== Building JWT auth backend plugin from source."
  sh "cd mqtt/jwt_plugin/; make dist"
end

# Re-init docker stuff

processes = `sudo docker ps -a -f "name=farmbot-mqtt" -q`
if processes.present?
  puts "=== Stopping pre-existing farmbot containers"
  sh "cd mqtt; sudo docker rm #{processes}"
end

if IMG_IS_BUILT
  puts "=== Destroying old docker images"
  sh "cd mqtt; sudo docker rmi #{DOCKER_IMG_NAME} --force"
end

puts "=== Building docker image"
sh "cd mqtt; sudo docker build -t farmbot-mqtt ."

puts "=== Starting MQTT"
exec [
  'cd mqtt;',
  'sudo docker run',
  '-p "15672:15672"',
  '-p "5672:5672"',
  '-p "3002:15675"',
  '-p "8883:8883"',
  '-p "1883:1883"',
  '--name "farmbot-mqtt"',
  '-v "$(pwd)/conf:/etc/rabbitmq"',
  '-v "$(pwd)/rabbitmq:/var/lib/rabbitmq"',
  'farmbot-mqtt'
].join(" ")
