class LogDispatch < ApplicationRecord
  class RateLimitError < StandardError; end

  belongs_to :device
  belongs_to :log

  class_attribute :max_per_hour
  self.max_per_hour = 20

  # If this method grows, create a mutation.
  def self.deliver(device, log_or_logs)
    Array
      .wrap(log_or_logs)
      .select { |log | (log["channels"] || []).include?("email") }
      .map    { |log | { device: device, log: log }}
      .tap    { |logs| self.create!(logs) }
    LogDeliveryMailer
      .log_digest(device)
      .deliver_later
  end
end
