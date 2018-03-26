class LogDeliveryMailer < ApplicationMailer

  def log_digest(device)
    total_sent_this_hour = LogDispatch
                              .where(sent_at: 1.hours.ago..Time.now)
                              .count
    if total_sent_this_hour > LogDispatch.max_per_hour
      raise LogDispatch::RateLimitError,
              "Device #{device.id} is sending too many emails!!! (> 20 / hr)"
    end
    ld        = LogDispatch.where(sent_at: nil, device: device)
    if(ld.any?)
      logs         = Log.find(ld.pluck(:log_id))
      @emails      = device.users.pluck(:email)
      @messages    = logs.map(&:message)
      @device_name = device.name || "Farmbot"
      mail(to: @emails, subject: "🌱 New message from #{@device_name}!")
      ld.update_all(sent_at: Time.now)
    end
  end
end
