class LogDispatch < ApplicationRecord
  class RateLimitError < StandardError; end

  belongs_to :device
  belongs_to :log

  class_attribute :max_per_hour
  self.max_per_hour = 20

  WAIT_PERIOD = 30
  WAIT_UNIT   = :seconds

  # If this method grows, create a mutation.
  def self.deliver(device, log)
    send_routine_emails(log, device)
    send_fatal_emails(log, device)
  end

  def self.digest_wait_time
    { wait: WAIT_PERIOD.send(WAIT_UNIT) }
  end

  # TODO: Why must I explicitly pass `mailer_klass`? Somethings not right with
  #       mocks.
  def self.send_routine_emails(log, device, mailer_klass = LogDeliveryMailer)
    return unless (log.channels || []).include?("email")
    self.create!(device: device, log: log)
    mailer_klass.log_digest(device).deliver_later(digest_wait_time)
  end

  def self.send_fatal_emails(log, device)
    return unless (log.channels || []).include?("fatal_email")
    FatalErrorMailer.fatal_error(device, log).deliver_later
  end

  def broadcast?
    false
  end
end
