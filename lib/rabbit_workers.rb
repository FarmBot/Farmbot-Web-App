# :nocov:
require "thread"
require "thwait"

class RabbitWorker
  WAIT = 3
  def self.thread
    Thread.new do
      yield
    rescue => e
      Rollbar.error(e)
      puts "Connecting to broker in #{WAIT} seconds. (#{e.inspect})"
      sleep WAIT
      retry
    end
  end

  def self.go!
    t = Transport.current

    loop do
      ThreadsWait.all_waits([
        thread { TelemetryService.new.go!(t.telemetry_channel) },
        thread { LogService.new.go!(t.log_channel) },
      ])
    end
  rescue => e
    Rollbar.error(e)
    sleep RabbitWorker::WAIT
    retry
  end
end

sleep(RabbitWorker::WAIT * 2)

RabbitWorker.go!
