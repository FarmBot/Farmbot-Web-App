class CreateAttachmentFromUrlJob < ApplicationJob
  queue_as :default

  def perform(image:,attachment_url:)
    image.set_attachment_by_url(attachment_url)
  end
end
