class LogDeliveryMailer < ApplicationMailer
  # Set a reasonably high limit on the number of emails that can appear in one
  # digest. If the log worker ever crashes for extended periods, this will
  # prevent us from sending user a log digest that is 20,000 lines long.
  MAX_PER_DIGEST = 1000
  WHOAH          = "Device %s is sending too many emails!!! (> 20 / hr)"
  SUBJECT        = "🌱 New message from %s!"

  def log_digest(device)
    Log.transaction do
      unsent         = device.unsent_routine_emails.limit(MAX_PER_DIGEST)
      send_a_digest(device, unsent) if unsent.any?
    end
  end

  private

  def timestamp(time, zone)
    time.in_time_zone(zone).strftime("%F %I:%M %p")
  end

  def send_a_digest(device, unsent)
    timezone     = device.timezone || "UTC"
    @emails      = device.users.pluck(:email)
    @messages    = unsent
                    .pluck(:created_at, :message)
                    .map{|(t,m)| [timestamp(t, timezone), m] }
                    .map{|(x,y)| "[#{x}]: #{y}"}
    @device_name = device.name
    mail(to: @emails, subject: SUBJECT % [@device_name])
    unsent.update_all(sent_at: Time.now)
  end

end
