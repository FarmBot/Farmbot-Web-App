require_relative "../app/lib/service_runner_base.rb"

begin
  ServiceRunner.go!(Transport.current.log_channel, LogService)
# :nocov:
rescue
  sleep 3
  retry
end
# :nocov:
