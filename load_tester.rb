devices = Device.all

1_000_000.times do |num|
  puts "Load test #{num}"
  devices.map { |x| Transport.amqp_send({}.to_json, x.id, "logs") }
  sleep 1
end
