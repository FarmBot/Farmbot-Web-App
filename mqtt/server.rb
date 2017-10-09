require 'erb'
puts "=== Retrieving container info"
DOCKER_IMG_NAME     = "farmbot-mqtt"
IS_BUILT            = `cd mqtt; sudo docker images`.include?(DOCKER_IMG_NAME)

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

# Re-init docker stuff

puts "=== Stopping any pre-existing farmbot containers"
`cd mqtt; sudo docker rm $(sudo docker ps -a -f "name=farmbot-mqtt" -q)`

if IS_BUILT
  puts "=== Destroying old docker images"
  `cd mqtt; sudo docker rmi #{DOCKER_IMG_NAME} --force`
end

puts "=== Building docker image"
`cd mqtt; sudo docker build -t farmbot-mqtt .`

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
