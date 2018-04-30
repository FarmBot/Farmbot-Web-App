class DataDumpMailer < ApplicationMailer
  SUBJECT = "FarmBot Account Data Export"
  attr_reader :device

  def email_json_dump(device)
    @device      = device
    attachments['export.json'] = {
      mime_type: 'application/mymimetype',
      content:   Devices::Dump.run!(device: device).to_json
    }
    mail to: recipients, subject: SUBJECT
  end

  def recipients
    @recipients ||= device.users.pluck(:email)
  end
end
