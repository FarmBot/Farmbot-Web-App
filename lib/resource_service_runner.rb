require_relative "../app/lib/service_runner_base.rb"

ServiceRunner.go!(Transport.current.resource_channel, Resources::Service)
