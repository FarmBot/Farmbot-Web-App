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
  SERVICES = { log_channel:      LogService,
               resource_channel: Resources::Service }

  def run_it!(chan, service)
    puts " = = = = = Running #{service} on #{chan}"
    ServiceRunner.go!(Transport.current.send(chan), service)
  rescue
    sleep 3
    retry
  end

  def thread(channel, service)
    Thread.new { run_it!(channel, service) }
  end

  def threads
    @threads ||= SERVICES.map { |(c,s)| thread(c, s) }
  end

  def self.go!
    ThreadsWait.all_waits(self.new.threads)
  end
end

sleep 15
puts "`sleep 15` is not OK - just testing stuff out. RC"
RabbitWorker.go!

# :nocov:
