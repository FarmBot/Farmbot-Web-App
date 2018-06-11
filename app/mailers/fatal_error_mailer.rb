class FatalErrorMailer < ApplicationMailer
  def fatal_error(device, log)
    Log.transaction do
      @emails      = device.users.pluck(:email)
      @logs        = device
                      .logs
                      .where(Log::IS_FATAL_EMAIL)
                      .where(sent_at: nil)
      return if @logs.empty?
      @message     = @logs
                      .pluck(:message)
                      .join("\n\n")
      @device_name = device.name || "Farmbot"
      mail(to: @emails, subject: "🚨 New error reported by #{@device_name}!")
      @logs.update_all(sent_at: Time.now)
    end
  end
end
