class ServiceRunner
  WAIT_TIME     = Rails.env.test? ? 0.01 : 5
  OFFLINE_ERROR = Bunny::TCPConnectionFailedForAllHosts
  CRASH_MSG     = Rails.env.test? ?
    "\e[32m.\e[0m" : "Something caused the broker to crash...\n"

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
  rescue OFFLINE_ERROR => e
  rescue StandardError => e
    unless e.is_a?(OFFLINE_ERROR)
      Rollbar.error(e)
      print CRASH_MSG
    end
    sleep WAIT_TIME
    retry
  end
end
