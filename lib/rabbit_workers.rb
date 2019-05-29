# :nocov:
require "thread"
require "thwait"

require_relative "../app/lib/resources.rb"
require_relative "../app/lib/resources/job.rb"
require_relative "../app/lib/resources/preprocessor.rb"
require_relative "../app/lib/resources/service.rb"

class RabbitWorker
  WAIT = 3
  def self.thread
    Thread.new do
      yield
    rescue => e
      puts "Connecting to broker in #{WAIT} seconds. (#{e.inspect})"
      sleep WAIT
      retry
    end
  end

  def self.go!
    loop do
      ThreadsWait.all_waits([
        thread { LogService.new.go!(Transport.current.log_channel) },
        thread { Resources::Service.new.go!(Transport.current.resource_channel) },
      ])
    end
  rescue
    sleep RabbitWorker::WAIT
    retry
  end
end

sleep(RabbitWorker::WAIT * 2)

RabbitWorker.go!
