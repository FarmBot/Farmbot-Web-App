class DataDumpMailer < ApplicationMailer
  SUBJECT          = "FarmBot Account Data Export"
  EXPORT_MIME_TYPE = "application/json"
  EXPORT_FILENAME  = "export.json"

  attr_reader :device

  def email_json_dump(device)
    @device = device
    attachments[EXPORT_FILENAME] = \
      { mime_type: EXPORT_MIME_TYPE, content: export_data }
    mail to: recipients, subject: SUBJECT
  end

  def recipients
    @recipients ||= device.users.pluck(:email)
  end

  def export_data
    @export_data ||= Devices::Dump.run!(device: device).to_json
  end
end
