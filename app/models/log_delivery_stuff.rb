# Prevents spamming a user when a malfunctioning Farmware tries to send
# 200000 emails in 4 seconds.
# Also helps group "fast" messages into a digest.
module LogDeliveryStuff
  class RateLimitError < StandardError; end

  module ClassMethods
    # If this method grows, create a mutation.
    def deliver(device, log)
      send_fatal_emails(log, device)
    end

    def send_fatal_emails(log, device)
      return unless (log.channels || []).include?("fatal_email")
      FatalErrorMailer.fatal_error(device, log).deliver_later
    end
  end

  def self.included(receiver)
    receiver.extend(ClassMethods)
  end
end
