# :nocov:
require "thread"
require "thwait"

require_relative "../app/lib/resources.rb"
require_relative "../app/lib/resources/job.rb"
require_relative "../app/lib/resources/preprocessor.rb"
require_relative "../app/lib/resources/service.rb"
require_relative "../app/lib/service_runner_base.rb"
require_relative "../app/lib/service_runner_base.rb"

class RabbitWorker
  class FakePing
    def self.process(info, payl)
      puts "====================================="
      puts info
      puts payl
      puts "====================================="
    end
  end

  WAIT     = 3
  SERVICES = {
    log_channel:      LogService,
    resource_channel: Resources::Service,
    ping_channel:     FakePing
  }

  def run_it!(chan, service)
    puts " Attempting to connect #{service} to #{chan}"
    ServiceRunner.go!(Transport.current.send(chan), service)
  rescue
    puts "Connecting to broker in #{WAIT} seconds."
    sleep WAIT
    retry
  end

  def thread(channel, service)
    Thread.new { run_it!(channel, service) }
  end

  def threads
    @threads ||= SERVICES.map { |(c,s)| thread(c, s) }
  end

  def self.go!
    loop do
      ThreadsWait.all_waits(self.new.threads)
    end
  end
end

sleep(RabbitWorker::WAIT * 2)

begin
  RabbitWorker.go!
rescue
  sleep RabbitWorker::WAIT
  retry
end
