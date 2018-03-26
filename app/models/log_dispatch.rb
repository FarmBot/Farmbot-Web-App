class LogDispatch < ApplicationRecord
  class RateLimitError < StandardError; end

  belongs_to :device
  belongs_to :log

  class_attribute :max_per_hour
  self.max_per_hour = 20

  # If this method grows, create a mutation.
  def self.deliver(device, log_or_logs)
    list = Array.wrap(log_or_logs)
    send_routine_emails(list, device)
    send_fatal_emails(list, device)
  end

  def self.send_routine_emails(log_array, device)
    log_array
      .select { |log | (log["channels"] || []).include?("email") }
      .map    { |log | { device: device, log: log }}
      .tap    { |logs| self.create!(logs) }

    LogDeliveryMailer.log_digest(device).deliver_later
  end

  def self.send_fatal_emails(log_array, device)
    log_array
      .select { |log| (log["channels"] || []).include?("fatal_email") }
      .map    { |log| FatalErrorMailer.fatal_error(device, log).deliver_later }
  end

  def broadcast?
    false
  end
end
