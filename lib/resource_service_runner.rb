require_relative "./resource_service"

begin
  # Listen to all logs on the message broker and store them in the database.
  Transport
    .current
    .resource_channel
    .subscribe(block: true) do |info, _, payl|
      ResourceService.process(info, payl.force_encoding("UTF-8"))
    end
rescue StandardError => e
  Rollbar.error(e)
  puts "MQTT Broker is unreachable. Waiting 5 seconds..."
  sleep 5
  retry
end
