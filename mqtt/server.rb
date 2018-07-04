require 'erb'

def needs_admin_password
  raise "You must set an ADMIN_PASSWORD in application.yml."
end

puts "=== Retrieving container info"
DOCKER_IMG_NAME = "farmbot-mqtt"
IMG_IS_BUILT    = `cd mqtt; sudo docker images`.include?(DOCKER_IMG_NAME)

puts "=== Setting config data"
CONFIG_PATH      = "./mqtt"
CONFIG_FILENAME  = "rabbitmq.conf"
CONFIG_OUTPUT    = "#{CONFIG_PATH}/#{CONFIG_FILENAME}"
NO_API_HOST      = "\nYou MUST set API_HOST to a real IP address or " +
                   "domain name (not localhost).\n" +
                   "API_PORT is also mandatory."
TEMPLATE_FILE    = "./mqtt/rabbitmq.conf.erb"
TEMPLATE         = File.read(TEMPLATE_FILE)
RENDERER         = ERB.new(TEMPLATE)
PROTO            = ENV["FORCE_SSL"] ? "https:" : "http:"
VHOST            = ENV.fetch("MQTT_VHOST") { "/" }
admin_password   = ENV.fetch("ADMIN_PASSWORD")  { needs_admin_password }.inspect

needs_admin_password if admin_password.length < 5

fully_formed_url = PROTO + $API_URL

if !ENV["API_HOST"] || !ENV["API_PORT"]
  puts NO_API_HOST
  exit
end

# Write the config file.
File.write(CONFIG_OUTPUT, RENDERER.result(binding))

# Re-init docker stuff

processes = `sudo docker ps -a -f "name=farmbot-mqtt" -q`

if processes.present?
  puts "=== Stopping pre-existing farmbot containers"
  sh "cd mqtt && sudo docker stop #{processes}"
  sh "cd mqtt && sudo docker rm #{processes}"
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
  '-p "5672:5672"',   # AMQP (RabbitMQ)
  '-p "1883:1883"',   # MQTT
  '-p "8883:8883"',   # MQTT over TLS/SSL
  '-p "3002:15675"',  # MQTT over WebSockets
  '-p "15672:15672"', # Management API
  '--name "farmbot-mqtt"',
  'farmbot-mqtt'
].join(" ")
