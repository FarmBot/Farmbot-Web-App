class LogDispatch < ApplicationRecord
  class RateLimitError < StandardError; end

  belongs_to :device
  belongs_to :log

  class_attribute :max_per_hour
  self.max_per_hour = 20

  # If this method grows, create a mutation.
  def self.deliver(device, log)
    send_routine_emails(log, device)
    send_fatal_emails(log, device)
  end

  def self.send_routine_emails(log, device)
    return unless (log["channels"] || []).include?("email")
    self.create!(device: device, log: log)
    LogDeliveryMailer.log_digest(device).deliver_later
  end

  def self.send_fatal_emails(log, device)
    return unless (log["channels"] || []).include?("fatal_email")
    FatalErrorMailer.fatal_error(device, log).deliver_later
  end

  def broadcast?
    false
  end
end
