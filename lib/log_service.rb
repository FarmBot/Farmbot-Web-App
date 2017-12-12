require_relative "./log_service_support"

begin
  # Listen to all logs on the message broker and store them in the database.
  puts "Starting device log service..."

  Transport
    .log_channel
    .subscribe(block: true) { |info, _, payl| LogService.process(info, payl) }
rescue => Bunny::TCPConnectionFailedForAllHosts
  puts "MQTT Broker is unreachable. Waiting 5 seconds..."
  sleep 5
  retry
end
