class FatalErrorMailer < ApplicationMailer
  def fatal_error(device, log)
    Log.transaction do
      @emails      = device.users.pluck(:email)
      @logs        = device
                      .logs
                      .where(Log::IS_FATAL_EMAIL)
                      .where(sent_at: nil)
                      .order(created_at: :desc)
      return if @logs.empty?
      @message     = @logs
                      .pluck(:created_at, :message)
                      .map{|(t,m)| [t.in_time_zone(device.timezone || "UTC"), m] }
                      .map{|(x,y)| "[#{x}]: #{y}"}
                      .join("\n\n")
      @device_name = device.name || "FarmBot"
      mail(to: @emails, subject: "🚨 New error reported by #{@device_name}!")
      @logs.update_all(sent_at: Time.now)
    end
  end
end
