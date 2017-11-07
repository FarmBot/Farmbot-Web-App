class CreateAttachmentFromUrlJob < ApplicationJob
  queue_as :default

  def perform(image:, attachment_url:)
    Device.current = image.device
    image.set_attachment_by_url(attachment_url)
    image.save!
    Device.current = nil
  rescue => e
    Rollbar.error('ERROR PROCESSING IMAGE!!', e)
    raise e
  end

  def max_attempts
    2
  end
end
