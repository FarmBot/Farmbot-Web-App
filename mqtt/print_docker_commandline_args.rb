# PURPOSE OF THIS FILE:
# Avoid asking the user for ENV var values twice. Re-use info provided in
# application.yml
puts [
  # ["-e",         "WEB_API_URL=http://localhost:3000"],
  ["-p",         "15672:15672"],
  ["-p",         "5672:5672"],
  ["-p",         "3002:15675"],
  ["-p",         "8883:8883"],
  ["-p",         "1883:1883"],
  ["--hostname", "farmbot-rabbit"],
  ["--name",     "farmbot-rabbit"],
  ["-v",         "$(pwd)/conf:/etc/rabbitmq"],
  ["-v",         "$(pwd)/rabbitmq:/var/lib/rabbitmq"]
].map{ |x| x.join(" ") }.join(" ")
