class LogDeliveryMailer < ApplicationMailer
  WHOAH = "Device %s is sending too many emails!!! (> 20 / hr)"

  def log_digest(device)
    query_params   = { sent_at: 1.hours.ago..Time.now, device_id: device.id }
    sent_this_hour = LogDispatch.where(query_params).count
    too_many       = sent_this_hour > LogDispatch.max_per_hour
    raise LogDispatch::RateLimitError, WHOAH % [device.id] if too_many
    ld             = LogDispatch.where(sent_at: nil, device: device)
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
