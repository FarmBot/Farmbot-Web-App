class CreateAttachmentFromUrlJob < ApplicationJob
  queue_as :default

  def perform(image:,attachment_url:)
    image.set_attachment_by_url(attachment_url)
    image.save!
  rescue => e
    Rollbar.log('EROR PROCESSING IMAGE!!', e)
    raise e
  end

  def max_attempts
    2
  end
end
