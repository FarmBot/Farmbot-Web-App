require_relative "../app/lib/service_runner_base.rb"

ServiceRunner.go!(Transport.current.log_channel, LogService)
