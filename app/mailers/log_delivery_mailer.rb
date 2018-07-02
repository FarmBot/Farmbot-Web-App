class LogDeliveryMailer < ApplicationMailer
  WHOAH = "Device %s is sending too many emails!!! (> 20 / hr)"

  def log_digest(device)
    Log.transaction do
      query_params   = { sent_at: 1.hours.ago..Time.now, device_id: device.id }
      sent_this_hour = Log.where(query_params).count
      too_many       = sent_this_hour > Log.max_per_hour
      raise Log::RateLimitError, WHOAH % [device.id] if too_many
      unsent         = Log.where(sent_at: nil, device: device)
      if(unsent.any?)
        logs         = Log
                        .where(id: unsent.pluck(:id))
                        .where
                        .not(Log::IS_FATAL_EMAIL)
        @emails      = device.users.pluck(:email)
        @messages    = logs.map(&:message)
        @device_name = device.name || "Farmbot"
        mail(to: @emails, subject: "🌱 New message from #{@device_name}!")
        unsent.update_all(sent_at: Time.now)
      end
    end
  end
end
