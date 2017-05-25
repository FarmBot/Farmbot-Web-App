class LogDispatch < ApplicationRecord
  belongs_to :device
  belongs_to :log

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
