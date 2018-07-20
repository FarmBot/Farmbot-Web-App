require_relative "../app/lib/service_runner_base.rb"
require_relative "../app/lib/resources.rb"
require_relative "../app/lib/resources/preprocessor.rb"
require_relative "../app/lib/resources/job.rb"
require_relative "../app/lib/resources/service.rb"
begin
  ServiceRunner.go!(Transport.current.resource_channel, Resources::Service)
rescue
  sleep 3
  retry
end
