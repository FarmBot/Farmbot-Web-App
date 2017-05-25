class LogDeliveryMailer < ApplicationMailer

  def log_digest(device)
    if LogDispatch.where(sent_at: 1.hours.ago..Time.now).count > 20
      raise "Device #{device.id} is sending too many emails!!! (> 20 / hr)"
    end
    ld        = LogDispatch.where(sent_at: nil, device: device)
    logs      = Log.find(ld.pluck(:log_id))
    @emails   = device.users.pluck(:email)
    @messages = logs.map(&:message)
    mail(to: @emails, subject: '🌱 New message from FarmBot!')
    ld.update_all(sent_at: Time.now)
  end
end
