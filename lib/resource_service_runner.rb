# require_relative "./service_runner_base.rb"

ServiceRunner.go!(Transport.current.resource_channel, Resources::Service)
