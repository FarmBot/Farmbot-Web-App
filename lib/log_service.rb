require_relative "./log_service_support"

# Listen to all logs on the message broker and store them in the database.
Transport
  .log_channel
  .subscribe(block: true) { |info, _, payl| LogService.process(info, payl) }
