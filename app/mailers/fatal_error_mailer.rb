class FatalErrorMailer < ApplicationMailer
  def fatal_error(device, log)
    @emails      = device.users.pluck(:email)
    @message     = log.message
    @device_name = device.name || "Farmbot"
    mail(to: @emails, subject: "🚨 New error reported by #{@device_name}!")
  end
end
