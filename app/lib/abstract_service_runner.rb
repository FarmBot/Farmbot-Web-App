class AbstractServiceRunner
  WAIT_TIME = Rails.env.test? ? 0.01 : 5
  OFFLINE_ERROR = Bunny::TCPConnectionFailedForAllHosts
  CRASH_MSG = Rails.env.test? ?
    "\e[32m.\e[0m" : "Something caused the broker to crash...\n"

  def go!(channel)
    channel.subscribe(block: true) do |info, _, payl|
      self.process(info, payl.force_encoding("UTF-8"))
    end
  rescue OFFLINE_ERROR, StandardError => e
    unless e.is_a?(OFFLINE_ERROR)
      Rollbar.error(e)
      print CRASH_MSG
    end
    sleep WAIT_TIME
    retry
  end
end
