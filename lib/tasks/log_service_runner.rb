require_relative "./service_runner_base.rb"

ServiceRunner.go!(Transport.current.log_channel, LogService)
