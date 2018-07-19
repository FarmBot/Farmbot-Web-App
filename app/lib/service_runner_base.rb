class ServiceRunner
  WAIT_TIME = Rails.env.test? ? 0.01 : 5

  def self.go!(channel, worker_klass)
    self.new(channel, worker_klass).run!
  end

  def initialize(channel, worker_klass)
    @channel = channel
    @worker  = worker_klass
  end

  def run!
    @channel.subscribe(block: true) do |info, _, payl|
      @worker.process(info, payl.force_encoding("UTF-8"))
    end
  rescue StandardError => e
    Rollbar.error(e)
    puts "MQTT Broker is unreachable. Waiting 5 seconds..."
    sleep WAIT_TIME
    retry
  end
end
