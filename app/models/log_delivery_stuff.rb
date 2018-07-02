# Prevents spamming a user when a malfunctioning Farmware tries to send
# 200000 emails in 4 seconds.
# Also helps group "fast" messages into a digest.
module LogDeliveryStuff
  class RateLimitError < StandardError; end
  WAIT_PERIOD = 30
  WAIT_UNIT   = :seconds

  module ClassMethods
    attr_accessor :max_per_hour

    # If this method grows, create a mutation.
    def deliver(device, log)
      send_routine_emails(log, device)
      send_fatal_emails(log, device)
    end

    def digest_wait_time
      { wait: WAIT_PERIOD.send(WAIT_UNIT) }
    end

    # TODO: Why must I explicitly pass `mailer_klass`? Somethings not right with
    #       mocks.
    def send_routine_emails(log, device, mailer_klass = LogDeliveryMailer)
      return unless (log.channels || []).include?("email")
      mailer_klass.log_digest(device).deliver_later(digest_wait_time)
    end

    def send_fatal_emails(log, device)
      return unless (log.channels || []).include?("fatal_email")
      FatalErrorMailer.fatal_error(device, log).deliver_later
    end
  end

  def self.included(receiver)
    receiver.extend(ClassMethods)
    receiver.max_per_hour = 20
  end
end
